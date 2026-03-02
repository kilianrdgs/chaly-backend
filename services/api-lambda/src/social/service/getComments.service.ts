// cuites/service/getComments.service.ts
import { getCommentsRepo } from "../repository/getComments.repo";

export async function getCommentsService(cuiteId: number) {
	return getCommentsRepo(cuiteId);
}
