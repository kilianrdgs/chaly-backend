import CustomError, { StatusCodeEnum } from "../../utils/customError";
import { extractBedrockText, invokeBedrockModel } from "../utils/bedrock";

export interface ReasoningStageProcessParams {
  visionStageOutput: string;
  prompt: string;
}

export interface ReasoningStageOutput {
  titles: string[];
  description: string;
  challengeRespected?: boolean;
}

export default class BedrockReasoningStageService {
  async processWithReasoningStage(
    params: ReasoningStageProcessParams
  ): Promise<ReasoningStageOutput> {
    const input = {
      modelId:
        "arn:aws:bedrock:eu-west-3:762233728636:inference-profile/eu.anthropic.claude-3-7-sonnet-20250219-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [{ role: "user", content: params.prompt }],
        max_tokens: 200,
        temperature: 0.9,
      }),
    };

    const raw = await invokeBedrockModel(input);
    const content = extractBedrockText(raw);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      throw new CustomError(
        "Format JSON invalide dans la réponse du reasoning stage",
        StatusCodeEnum.InternalServerError
      );

    const result = JSON.parse(jsonMatch[0]);

    const hasValidTitles =
      Array.isArray(result.titles) &&
      result.titles.length >= 1 &&
      result.titles.every(
        (t: unknown) => typeof t === "string" && t.trim().length > 0
      );

    if (!hasValidTitles || !result.description)
      throw new CustomError(
        "Format de réponse du reasoning stage invalide",
        StatusCodeEnum.InternalServerError
      );

    console.log("[ReasoningStage] ✅", result);
    return result;
  }
}
