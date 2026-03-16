import CustomError, { StatusCodeEnum } from "../../utils/customError";
import { extractBedrockText, invokeBedrockModel } from "../utils/bedrock";

export interface VisionStageImageAnalysisParams {
  imageBase64: string;
  imageFormat: string;
  prompt: string;
}

export default class BedrockVisionStageService {
  async analyzeImage(params: VisionStageImageAnalysisParams): Promise<string> {
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
              { text: params.prompt },
              {
                image: {
                  format: params.imageFormat,
                  source: { bytes: params.imageBase64 },
                },
              },
            ],
          },
        ],
        inferenceConfig: { temperature: 0.3, maxTokens: 200 },
      }),
    };

    const raw = await invokeBedrockModel(input);
    const content = extractBedrockText(raw);

    if (!content)
      throw new CustomError(
        "Réponse vide du vision stage",
        StatusCodeEnum.InternalServerError
      );

    console.log("[VisionStage] ✅", content.slice(0, 200));
    return content;
  }
}
