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

export interface NovaImageAnalysisParams {
	imageBase64: string;
	imageFormat: string;
	prompt: string;
}

export default class BedrockNovaService {
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
					`[Nova] Throttling detecté, retry ${
						attempt + 1
					}/${maxRetries} dans ${Math.round(delay)}ms`,
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		throw lastError;
	}

	/**
	 * Analyse une image avec Amazon Nova Lite
	 * @param params - Paramètres contenant l'image en base64, le format et le prompt
	 * @returns La description factuelle de l'image
	 */
	async analyzeImage(params: NovaImageAnalysisParams): Promise<string> {
		try {
			const input = {
				modelId:
					"arn:aws:bedrock:eu-west-3:762233728636:inference-profile/eu.amazon.nova-lite-v1:0",
				contentType: "application/json",
				accept: "application/json",
				body: JSON.stringify({
					messages: [
						{
							role: "user",
							content: [
								{
									text: params.prompt,
								},
								{
									image: {
										format: params.imageFormat,
										source: {
											bytes: params.imageBase64,
										},
									},
								},
							],
						},
					],
					inferenceConfig: {
						temperature: 0.3,
						maxTokens: 200,
					},
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
					"Aucune réponse reçue de Nova",
					StatusCodeEnum.NoContent,
				);
			}

			// Parse la réponse JSON de Nova
			const parsed = JSON.parse(text);
			const content = parsed?.output?.message?.content?.[0]?.text || text;

			return content;
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
			console.error("[Nova] Erreur lors de l'analyse:", {
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
				"Erreur lors de l'analyse d'image avec Nova",
				StatusCodeEnum.InternalServerError,
			);
		}
	}
}
