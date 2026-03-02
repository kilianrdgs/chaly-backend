import Expo, { type ExpoPushMessage } from "expo-server-sdk";
import { getLastChallengeId } from "../../challenges/repository/getChallengeId.repo";
import getAllNotifTokenRepo from "../repository/getAllNotifToken.repo";
import getNotifTokensNotPostedRepo from "../repository/getNotifTokensNotPosted.repo";
import { lastCallBodies, pickRandom } from "../utils/messages";

const expo = new Expo();

export async function cronNotificationService(type: string) {
	const responseLastChallengeId = await getLastChallengeId();

	const time = "18h59";

	try {
		const users = await getNotifTokensNotPostedRepo(responseLastChallengeId);

		const messages: ExpoPushMessage[] = users.map((user) => ({
			to: user.TokenNotification as string,
			sound: "notif-challenge.wav",
			title: `⏰ ${user.Pseudo} ?`,
			subtitle: `Tu as jusqu'à ${time} pour poster 📸`,
			body: pickRandom(lastCallBodies),
			priority: "high",
		}));

		const chunks = expo.chunkPushNotifications(messages);

		for (const chunk of chunks) {
			try {
				const tickets = await expo.sendPushNotificationsAsync(chunk);
				console.log("✅ Notifications envoyées:", tickets);
			} catch (err) {
				console.error("❌ Erreur d'envoi du chunk:", err);
			}
		}
	} catch (error) {
		console.error("❌ Erreur cronDailyService:", error);
	}
}
