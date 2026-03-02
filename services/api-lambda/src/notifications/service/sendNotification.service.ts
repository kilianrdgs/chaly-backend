import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import type { NotificationTypeEnum } from "../../globals/notificationTypeEnum";
import { getUserInformationRepo } from "../../users/repository/getUserInformation.repo";
import { getNotificationTokenByPseudoRepo } from "../repository/getNotificationTokenByPseudo.repo";

export async function sendNotifService(
	deps: ServiceDeps,
	userId: number,
	pseudo: string,
	type: NotificationTypeEnum,
	postId: number | null = null,
): Promise<undefined | CustomError> {
	const tokenNotif = await getNotificationTokenByPseudoRepo(pseudo);
	if (tokenNotif instanceof CustomError) return tokenNotif;
	if (!tokenNotif) {
		console.warn("envoie de notif mais pas de token de notif en base");
		return;
	}
	const pseudoSender = await getUserInformationRepo(userId);
	if (pseudoSender instanceof CustomError) {
		return pseudoSender;
	}

	return await deps.pushService.pushNotification(
		tokenNotif,
		pseudoSender.Pseudo,
		type,
		postId,
	);
}
