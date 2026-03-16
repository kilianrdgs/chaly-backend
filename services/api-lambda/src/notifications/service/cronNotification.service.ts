import { getCurrentChallengeRepo } from "../../challenges/repository/getCurrentChallenge.repo";
import getNotifTokensNotPostedRepo from "../repository/getNotifTokensNotPosted.repo";
import {
  lastCallBodies,
  noonCallBodies,
  pickRandom,
  voteReminderBodies,
} from "../utils/messages";
import { sendPushToMultiple } from "./sendPushToMultiple.service";

export async function cronNotificationService(type: string) {
  const responseLastChallengeId = await getCurrentChallengeRepo();

  try {
    const responseTokens = await getNotifTokensNotPostedRepo(
      responseLastChallengeId
    );
    console.log(
      `📧 Envoi de ${responseTokens.length} notifications de rappel...`
    );

    const tokens = responseTokens
      .map((user) => user.TokenNotification)
      .filter((token): token is string => !!token);

    await sendPushToMultiple(
      tokens,
      type === "challenge_midi"
        ? "Tu manges quoi ? 👹"
        : type === "challenge_vote_reminder"
        ? "🔥 VOTE MAINTENANT"
        : `Tu as jusqu'à ${19}h pour poster`,
      pickRandom(
        type === "challenge_midi"
          ? noonCallBodies
          : type === "challenge_vote_reminder"
          ? voteReminderBodies
          : lastCallBodies
      )
    );

    console.log("✅ Envoi des notifications de rappel terminé");
  } catch (error) {
    console.error("❌ Erreur cronNotificationService:", error);
  }
}
