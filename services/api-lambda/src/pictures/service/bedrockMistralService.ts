import {
	BedrockRuntimeClient,
	InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

const client = new BedrockRuntimeClient({
	region: "eu-west-3",
	credentials: {
		accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY || "",
	},
});

export interface MistralProcessParams {
	novaOutput: string;
	prompt: string;
}

export interface MistralOutput {
	title: string;
	description: string;
	challengeRespected?: boolean;
}

export default class BedrockMistralService {
	/**
	 * Fonction utilitaire pour retry avec backoff exponentiel
	 */
	private async retryWithBackoff<T>(
		fn: () => Promise<T>,
		maxRetries = 5,
		initialDelay = 1000,
	): Promise<T> {
		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				return await fn();
			} catch (error: unknown) {
				const err = error as Error & {
					name?: string;
					$metadata?: { httpStatusCode?: number };
				};
				lastError = err;

				// Si c'est une erreur de throttling/quota, on retry
				const isThrottling =
					err.name === "ThrottlingException" ||
					err.name === "TooManyRequestsException" ||
					err.$metadata?.httpStatusCode === 429;

				if (!isThrottling || attempt === maxRetries) {
					throw error;
				}

				// Backoff exponentiel avec jitter
				const delay = initialDelay * 2 ** attempt + Math.random() * 1000;
				console.log(
					`[Mistral] Throttling detecté, retry ${
						attempt + 1
					}/${maxRetries} dans ${Math.round(delay)}ms`,
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		throw lastError;
	}

	/**
	 * Traite la description de Nova avec Mistral pour obtenir le format final JSON
	 * @param params - Paramètres contenant la sortie de Nova et le prompt de style
	 * @returns Le JSON formaté avec titles, description et challengeRespected
	 */
	async processWithMistral(
		params: MistralProcessParams,
	): Promise<MistralOutput> {
		try {
			const input = {
				modelId:
					"arn:aws:bedrock:eu-west-3:762233728636:inference-profile/eu.anthropic.claude-3-7-sonnet-20250219-v1:0",
				contentType: "application/json",
				accept: "application/json",
				body: JSON.stringify({
					anthropic_version: "bedrock-2023-05-31",
					messages: [
						{
							role: "user",
							content: params.prompt,
						},
					],
					max_tokens: 200,
					temperature: 0.9,
				}),
			};

			const command = new InvokeModelCommand(input);
			const response = await this.retryWithBackoff(() => client.send(command));

			// Gestion compatible de la réponse selon la version du SDK
			let text: string;
			if (response.body) {
				if (typeof response.body === "string") {
					text = response.body;
				} else if (Buffer.isBuffer(response.body)) {
					text = response.body.toString("utf8");
				} else if ("transformToString" in response.body) {
					const body = response.body as unknown as {
						transformToString: (encoding: string) => string;
					};
					text = body.transformToString("utf8");
				} else if ("arrayBuffer" in response.body) {
					const body = response.body as unknown as {
						arrayBuffer: () => Promise<ArrayBuffer>;
					};
					const buffer = await body.arrayBuffer();
					text = buffer ? Buffer.from(buffer).toString("utf8") : "";
				} else {
					text = "";
				}
			} else {
				throw new CustomError(
					"Aucune réponse reçue de Mistral",
					StatusCodeEnum.NoContent,
				);
			}

			// Parse la réponse JSON de Mistral
			const parsed = JSON.parse(text);
			console.log(
				"[Mistral] Réponse brute parsed:",
				JSON.stringify(parsed, null, 2),
			);

			let content = text;

			// Mistral renvoie le texte dans parsed.choices[0].message.content
			if (parsed?.choices?.[0]?.message?.content) {
				content = parsed.choices[0].message.content;
				console.log("[Mistral] Content extrait (Mistral format):", content);
			}
			// Fallback: Claude renvoie le texte dans parsed.content[0].text
			else if (parsed?.content?.[0]?.text) {
				content = parsed.content[0].text;
				console.log("[Mistral] Content extrait (Claude format):", content);
			} else {
				console.log("[Mistral] Format non reconnu, utilisation du texte brut");
			}

			const jsonMatch = content.match(/\{[\s\S]*\}/);

			if (!jsonMatch) {
				console.error("[Mistral] Aucun JSON trouvé dans le content:", content);
				throw new CustomError(
					"Format JSON invalide dans la réponse Mistral",
					StatusCodeEnum.InternalServerError,
				);
			}

			console.log("[Mistral] JSON extrait:", jsonMatch[0]);
			const result: MistralOutput = JSON.parse(jsonMatch[0]);

			// Validation basique du format
			if (
				!result.title ||
				typeof result.title !== "string" ||
				!result.description
			) {
				throw new CustomError(
					"Format de réponse Mistral invalide",
					StatusCodeEnum.InternalServerError,
				);
			}

			return result;
		} catch (error: unknown) {
			if (error instanceof CustomError) {
				throw error;
			}

			const err = error as Error & {
				name?: string;
				message?: string;
				$metadata?: { httpStatusCode?: number; requestId?: string };
			};

			// Log détaillé de l'erreur
			console.error("[Mistral] Erreur lors du traitement:", {
				name: err.name,
				message: err.message,
				code: err.$metadata?.httpStatusCode,
				requestId: err.$metadata?.requestId,
			});

			// Si c'est toujours du throttling après tous les retries
			const isThrottling =
				err.name === "ThrottlingException" ||
				err.name === "TooManyRequestsException" ||
				err.$metadata?.httpStatusCode === 429;

			if (isThrottling) {
				throw new CustomError(
					"Service temporairement surchargé, réessayez dans quelques secondes",
					StatusCodeEnum.TooManyRequests,
				);
			}

			throw new CustomError(
				"Erreur lors du traitement avec Mistral",
				StatusCodeEnum.InternalServerError,
			);
		}
	}
}
