import { getInfoUserByCuiteIdRepo } from "../../cuites/repository/getInfoUserByCuiteId.repo";
import type { ServiceDeps } from "../../cuites/service/types";
// cuites/service/createComment.service.ts
import CustomError from "../../globals/customError";
import { sendNotifService } from "../../notifications/service/sendNotification.service";
import { createCommentRepo } from "../repository/createComment.api";
import { getSocialCountRepo } from "../repository/getSocialCount.repo";

export async function createCommentService(
	deps: ServiceDeps,
	cuiteId: number,
	userId: number,
	comment: string,
) {
	const resultComment = await createCommentRepo(cuiteId, userId, comment);
	if (resultComment instanceof CustomError) return resultComment;

	const info = await getInfoUserByCuiteIdRepo(cuiteId);
	if (info instanceof CustomError) return info;

	if (userId !== resultComment) {
		sendNotifService(deps, userId, info?.Username ?? "", 5, cuiteId);
	}

	// Retourner les compteurs mis à jour (likes + comments)
	const responseGetSocialCountRepo = await getSocialCountRepo(cuiteId, userId);
	if (responseGetSocialCountRepo instanceof CustomError)
		return responseGetSocialCountRepo;

	return responseGetSocialCountRepo;
}
