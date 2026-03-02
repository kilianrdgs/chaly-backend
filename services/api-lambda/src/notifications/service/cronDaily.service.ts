import Expo, { type ExpoPushMessage } from "expo-server-sdk";
import getAllNotifTokenRepo from "../repository/getAllNotifToken.repo";
import { bodies, pickRandom } from "../utils/messages";

const expo = new Expo();

export async function cronDailyService() {
	try {
		const users = await getAllNotifTokenRepo();

		const messages: ExpoPushMessage[] = users.map((user) => ({
			to: user.TokenNotification as string,
			sound: "notif-challenge.wav",
			title: "🔥⏰ Chaly time ⏰🔥",
			subtitle: `📸 Prends ta photo ${user.Pseudo}`,
			body: pickRandom(bodies),
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
