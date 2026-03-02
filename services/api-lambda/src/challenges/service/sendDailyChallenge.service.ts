import { sendDailyChallengeRepo } from "../repository/sendDailyChallenge.repo";

export async function sendDailyChallengeService() {
	return sendDailyChallengeRepo();
}
