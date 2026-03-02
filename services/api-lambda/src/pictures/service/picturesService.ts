import CustomError, { StatusCodeEnum } from "../../globals/customError";
import {
	type Language,
	getMistralPrompt,
	getNovaPrompt,
} from "../utils/iaParameters";
import BedrockMistralService from "./bedrockMistralService";
import BedrockNovaService from "./bedrockNovaService";

export default class PicturesService {
	private novaService: BedrockNovaService;
	private mistralService: BedrockMistralService;

	constructor() {
		this.novaService = new BedrockNovaService();
		this.mistralService = new BedrockMistralService();
	}

	async analyse(
		media: Express.Multer.File,
		challenge: string,
		language: string,
		personalityMode: string,
		cuiteId: number | null = null,
	) {
		try {
			const base64Image = media.buffer.toString("base64");
			const lang = (language as Language) ?? "fr";

			// Détecter le format de l'image
			const format = media.mimetype.split("/")[1] || "jpeg";

			// Étape 1: Analyse factuelle avec Nova
			const novaPrompt = getNovaPrompt(lang);
			const novaOutput = await this.novaService.analyzeImage({
				imageBase64: base64Image,
				imageFormat: format,
				prompt: novaPrompt,
			});

			if (!novaOutput) {
				return new CustomError(
					"pas de donnée trouvée de Nova",
					StatusCodeEnum.NoContent,
				);
			}

			// Étape 2: Styling avec le style unique via Mistral
			const mistralPrompt = getMistralPrompt(
				novaOutput,
				challenge,
				lang,
				personalityMode,
			);

			const result = await this.mistralService.processWithMistral({
				novaOutput,
				prompt: mistralPrompt,
			});

			// Si un cuiteId est fourni, mettre à jour la cuite avec le titre et la description
			if (cuiteId && result && result.title) {
				const { updatePendingCuiteRepo } = await import(
					"../../cuites/repository/updatePendingCuite.repo"
				);
				const titre = result.title;
				const description = result.description || null;

				await updatePendingCuiteRepo(cuiteId, titre, description);
			}

			return result;
		} catch (err: unknown) {
			if (err instanceof CustomError) {
				return err;
			}
			console.error("Erreur lors de l'analyse d'image:", err);
			throw new CustomError(
				"Erreur lors de l'analyse d'image",
				StatusCodeEnum.InternalServerError,
			);
		}
	}
}
