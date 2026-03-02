import { deleteTokenNotificationRepo } from "../repository/deleteTokenNotification.repo";

export async function deleteTokenNotificationService(userId: number) {
	return await deleteTokenNotificationRepo(userId);
}
