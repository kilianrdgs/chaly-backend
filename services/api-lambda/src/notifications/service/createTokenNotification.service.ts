import { saveTokenNotificationRepo } from "../repository/saveTokenNotification.repo";

export async function saveTokenNotificationService(
	userId: number,
	tokenNotification: string,
) {
	return await saveTokenNotificationRepo(userId, tokenNotification);
}
