import { Expo } from "expo-server-sdk";
import CustomError, { StatusCodeEnum } from "../globals/customError";
import { NotificationTypeEnum } from "../globals/notificationTypeEnum";

const expo = new Expo();

export default class PushService {
	async pushNotification(
		token: string,
		pseudo: string | null,
		type: NotificationTypeEnum,
		postId: number | null = null,
	) {
		if (!Expo.isExpoPushToken(token)) {
			console.error("❌ Token Expo invalide");
			return new CustomError(
				"❌ Token Expo invalide",
				StatusCodeEnum.Unauthorized,
			);
		}
		const { title, body } = this.getMessage(type, pseudo);

		const message = {
			to: token,
			sound: "notif.wav",
			title,
			body,
			data: {
				type: type,
				postId: postId,
			},
		};
		try {
			await expo.sendPushNotificationsAsync([message]);
			return;
		} catch (error) {
			console.error("❌ Erreur envoi push :", error);
			return new CustomError(
				"Erreur lors de l'envoi de notification",
				StatusCodeEnum.InternalServerError,
			);
		}
	}

	private getMessage(type: NotificationTypeEnum, pseudo: string | null) {
		switch (type) {
			case NotificationTypeEnum.PostResponse:
				return {
					title: `${pseudo} a répondu à ton post`,
					body: "Va vite lui répondre !",
				};
			case NotificationTypeEnum.PostJournalier:
				return {
					title: `${pseudo} t'a proposé un nouveau défi`,
					body: "Viens relever le défi du jour !",
				};
			case NotificationTypeEnum.PostWeekly:
				return {
					title: "Tu n'as pas posté depuis une semaine reviens",
					body: "Tu me manques 😭",
				};
			case NotificationTypeEnum.PostLike:
				return {
					title: `${pseudo}`,
					body: "a aimé ton post",
				};
			case NotificationTypeEnum.PostComment:
				return {
					title: `${pseudo}`,
					body: "a commenté ton post",
				};
			default:
				return {
					title: "Nouvelle notification",
					body: "Quelque chose de nouveau t'attend !",
				};
		}
	}
}
