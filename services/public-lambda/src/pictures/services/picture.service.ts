import CustomError, { StatusCodeEnum } from "../../utils/customError";
import {
  type Language,
  getReasoningStagePrompt,
  getVisionStagePrompt,
} from "../utils/iaParameters";
import BedrockReasoningStageService from "./reasoningStage.service";
import BedrockVisionStageService from "./visionStage.service";

export default class PicturesService {
  private visionStageService: BedrockVisionStageService;
  private reasoningStageService: BedrockReasoningStageService;

  constructor() {
    this.visionStageService = new BedrockVisionStageService();
    this.reasoningStageService = new BedrockReasoningStageService();
  }

  async analyse(
    imageBuffer: Buffer,
    mimeType: string,
    challenge: string | null,
    language: string,
    personalityMode: string,
    city?: string | null
  ) {
    try {
      const base64Image = imageBuffer.toString("base64");
      const lang = (language as Language) ?? "fr";

      // Détecter le format de l'image
      const format = mimeType.split("/")[1] || "jpeg";

      // Étape 1: Analyse factuelle avec le vision stage
      const visionStagePrompt = getVisionStagePrompt(lang);
      const visionStageOutput = await this.visionStageService.analyzeImage({
        imageBase64: base64Image,
        imageFormat: format,
        prompt: visionStagePrompt,
      });

      if (!visionStageOutput) {
        return new CustomError(
          "pas de donnée trouvée du vision stage",
          StatusCodeEnum.NoContent
        );
      }

      // Étape 2: Styling avec le style unique via le reasoning stage
      const reasoningStagePrompt = getReasoningStagePrompt(
        visionStageOutput,
        challenge,
        lang,
        personalityMode,
        city
      );

      const result = await this.reasoningStageService.processWithReasoningStage(
        {
          visionStageOutput,
          prompt: reasoningStagePrompt,
        }
      );

      // Note: Logique de patch BDD supprimée car public-lambda n'a pas accès à la DB

      return result;
    } catch (err: unknown) {
      if (err instanceof CustomError) {
        return err;
      }
      console.error("Erreur lors de l'analyse d'image:", err);
      throw new CustomError(
        "Erreur lors de l'analyse d'image",
        StatusCodeEnum.InternalServerError
      );
    }
  }
}
