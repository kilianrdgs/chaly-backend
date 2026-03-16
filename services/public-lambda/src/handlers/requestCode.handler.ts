import { Context } from "hono";
import { config } from "../config/env";
import { SmsService } from "../services/sms";

const smsService = new SmsService(config.API_TOP_MESSAGE_KEY);

export const requestCodeHandler = async (c: Context) => {
  const body = await c.req.json();

  try {
    const authResponse = await fetch(
      `${config.PRIVATE_AUTH_URL}/request-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.API_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    let responseBody = await authResponse.json();
    console.log("Response from auth-lambda:", JSON.stringify(responseBody));

    // Wrapping fallback
    const dataToProcess = responseBody?.data || responseBody;

    // Envoi du SMS si nécessaire
    if (dataToProcess?.phoneNumber && dataToProcess?.codeOtp) {
      try {
        console.log("Envoi du SMS à:", dataToProcess.phoneNumber);
        await smsService.sendOtp(
          dataToProcess.phoneNumber,
          dataToProcess.codeOtp
        );
        console.info("✅ SMS envoyé avec succès");
      } catch (smsError) {
        console.error("❌ Erreur SMS :", smsError);
        // Non bloquant
      }
    }

    // Suppression des données sensibles
    const { phoneNumber, codeOtp, ...cleanData } = dataToProcess;

    // Retourne la structure selon qu'elle soit wrappée ou non
    if (responseBody?.data) {
      return c.json(
        { ...responseBody, data: cleanData },
        authResponse.status as any
      );
    } else {
      return c.json(cleanData, authResponse.status as any);
    }
  } catch (error) {
    console.error("❌ Erreur appel auth-lambda:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erreur lors du traitement de la requête",
        },
      },
      500
    );
  }
};
