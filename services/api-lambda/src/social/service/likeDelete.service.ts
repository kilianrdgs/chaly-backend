import { getSocialCountRepo } from "../repository/getSocialCount.repo";
import { likeDeleteRepo } from "../repository/likeDelete.repo";

export async function likeDeleteService(cuiteId: number, userId: number) {
	const deleteResult = await likeDeleteRepo(cuiteId, userId);
	if (deleteResult instanceof Error) return deleteResult;

	const responseGetSocialCountRepo = await getSocialCountRepo(cuiteId, userId);
	if (responseGetSocialCountRepo instanceof Error)
		return responseGetSocialCountRepo;

	return responseGetSocialCountRepo;
}
