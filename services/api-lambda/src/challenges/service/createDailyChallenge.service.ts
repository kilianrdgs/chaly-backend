import { createDailyChallengeRepo } from "../repository/createDailyChallenge.repo";

export async function createDailyChallengeService() {
	return await createDailyChallengeRepo();
}
