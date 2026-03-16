import { Context } from "hono";
import { sendPushOldTokens } from "../services/pushNotifOldToken";

export const sendNotifHandler = async (c: Context) => {
  try {
    await sendPushOldTokens();
    return c.json({
      success: true,
      message: "Notifications envoyées aux anciens tokens",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "SEND_NOTIFICATION_ERROR",
          message: error instanceof Error ? error.message : "Erreur inconnue",
        },
      },
      500
    );
  }
};
