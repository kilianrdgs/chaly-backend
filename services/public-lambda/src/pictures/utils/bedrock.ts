import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";
import CustomError, { StatusCodeEnum } from "../../utils/customError";

export const bedrockClient = new BedrockRuntimeClient({
  region: "eu-west-3",
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Exécute une requête Bedrock et renvoie le body texte décodé
 * (timeout 10s, multi-format compatible, gère throttling et erreurs propres)
 */
export const invokeBedrockModel = async (
  input: InvokeModelCommandInput,
  timeoutMs = 10_000
): Promise<string> => {
  try {
    const command = new InvokeModelCommand(input);

    // Timeout global
    const response = await Promise.race([
      bedrockClient.send(command),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout Bedrock")), timeoutMs)
      ),
    ]);

    const body = (response as any).body;
    let text = "";

    if (typeof body === "string") text = body;
    else if (Buffer.isBuffer(body)) text = body.toString("utf8");
    else if (body?.transformToString) text = body.transformToString("utf8");
    else if (body?.arrayBuffer) {
      const buffer = await body.arrayBuffer();
      text = Buffer.from(buffer).toString("utf8");
    }

    if (!text) {
      throw new CustomError(
        "Aucune réponse reçue de Bedrock",
        StatusCodeEnum.NoContent
      );
    }

    if (text.length > 100_000) {
      throw new CustomError(
        "Réponse Bedrock anormalement longue",
        StatusCodeEnum.InternalServerError
      );
    }

    return text;
  } catch (error: unknown) {
    const err = error as Error & {
      name?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number; requestId?: string };
    };

    console.error("[BedrockUtils] ❌ Erreur:", {
      name: err.name,
      message: err.message,
      code: err.$metadata?.httpStatusCode,
      requestId: err.$metadata?.requestId,
    });

    if (
      err.name === "ThrottlingException" ||
      err.name === "TooManyRequestsException" ||
      err.$metadata?.httpStatusCode === 429
    ) {
      throw new CustomError(
        "Service Bedrock surchargé, réessaie plus tard",
        StatusCodeEnum.TooManyRequests
      );
    }

    if (err.message?.includes("Timeout")) {
      throw new CustomError(
        "Délai dépassé pour la requête Bedrock",
        StatusCodeEnum.RequestTimeout
      );
    }

    throw new CustomError(
      "Erreur interne lors de la requête Bedrock",
      StatusCodeEnum.InternalServerError
    );
  }
};

/**
 * Essaie d’extraire un texte utile du body JSON Bedrock
 * (gère Claude / Nova / formats mixtes)
 */
export const extractBedrockText = (rawText: string): string => {
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    console.warn("[BedrockUtils] JSON non valide, tentative brute");
    return rawText;
  }

  return (
    parsed?.output?.message?.content?.[0]?.text ||
    parsed?.results?.[0]?.outputText ||
    parsed?.choices?.[0]?.message?.content ||
    parsed?.content?.[0]?.text ||
    parsed?.outputText ||
    rawText
  );
};
