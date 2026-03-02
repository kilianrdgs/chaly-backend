import { getLikesRepo } from "../repository/getLikes.repo";

export async function getLikesService(cuiteId: number) {
	return getLikesRepo(cuiteId);
}
