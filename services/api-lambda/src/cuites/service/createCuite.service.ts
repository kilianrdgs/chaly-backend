// cuites/service/createCuite.service.ts
import { getLastChallengeId } from "../../challenges/repository/getChallengeId.repo";
import type { CuiteData } from "../models/cuite.model";
import { createCuiteRepo } from "../repository/createCuite.repo";
import { updateLastPostRepo } from "../repository/updateLastPost.repo";
import type { ServiceDeps } from "./types";

export async function createCuiteService(deps: ServiceDeps, cuite: CuiteData) {
	const reponseLastChallengeId = await getLastChallengeId();

	const createdId = await createCuiteRepo(
		cuite.UserId,
		cuite,
		reponseLastChallengeId,
	);

	if (typeof createdId === "number") {
		await updateLastPostRepo(cuite.UserId);
	}

	return createdId;
}
