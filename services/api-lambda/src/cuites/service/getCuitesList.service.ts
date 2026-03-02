// cuites/service/getCuitesList.service.ts
import { getLastChallengeId } from "../../challenges/repository/getChallengeId.repo";
import CustomError from "../../globals/customError";
import { getIdByPseudoRepo } from "../../users/repository/getIdByPseudo";
import { getCuitesListRepo } from "../repository/getCuitesList.repo";
import type { ServiceDeps } from "./types";

export async function getCuitesListService(
	deps: ServiceDeps,
	limit: number,
	cursor: string | null,
	type: string,
	userId: number,
	pseudo: string | null = null,
	cuiteId: number | null = null,
) {
	if (pseudo) {
		const userId = await getIdByPseudoRepo(pseudo);
		if (userId instanceof CustomError) return userId;
		if (!userId) return new CustomError("User not found", 404);
		return getCuitesListRepo(limit, cursor, type, userId, cuiteId);
	}

	const reponseLastChallengeId = await getLastChallengeId();

	return await getCuitesListRepo(
		limit,
		cursor,
		type,
		userId,
		cuiteId,
		reponseLastChallengeId,
	);
}
