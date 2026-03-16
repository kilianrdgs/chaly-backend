import getAllNotifTokenRepo from "../repository/getAllNotifToken.repo";
import { sendPushToMultiple } from "./sendPushToMultiple.service";

export async function cronDailyService() {
  try {
    const responseTokens = await getAllNotifTokenRepo();
    console.log(
      `📧 Envoi de ${responseTokens.length} notifications quotidiennes...`
    );

    // Traiter les utilisateurs par batches

    const tokens = responseTokens
      .map((user) => user.TokenNotification)
      .filter((token): token is string => !!token);

    await sendPushToMultiple(
      tokens,
      "🔥 VOTE MAINTENANT",
      "⏱️ 1h. Après c’est trop tard."
    );

    console.log("✅ Envoi des notifications quotidiennes terminé");
  } catch (error) {
    console.error("❌ Erreur cronDailyService:", error);
  }
}
