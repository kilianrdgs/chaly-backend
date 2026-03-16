// cuites/service/deleteComment.service.ts
import CustomError from "../../globals/customError";
import { deleteCommentRepo } from "../repository/deleteComment.api";
import { getSocialCountRepo } from "../repository/getSocialCount.repo";

export async function deleteCommentService(commentId: number, userId: number) {
	const deleteResult = await deleteCommentRepo(commentId, userId);
	if (deleteResult instanceof CustomError) return deleteResult;

	// deleteResult contient maintenant le cuiteId
	const cuiteId = deleteResult;

	// Retourner les compteurs mis à jour (likes + comments)
	const responseGetSocialCountRepo = await getSocialCountRepo(cuiteId, userId);
	if (responseGetSocialCountRepo instanceof CustomError)
		return responseGetSocialCountRepo;

	return responseGetSocialCountRepo;
}
