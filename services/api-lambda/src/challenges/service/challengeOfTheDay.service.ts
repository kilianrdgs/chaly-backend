import { challengeOfTheDayRepo } from "../repository/challengeOfTheDay.repo";
import { getLastChallengeId } from "../repository/getChallengeId.repo";

export async function challengeOfTheDayService() {
	const reponseLastChallengeId = await getLastChallengeId();

	const responseRepo = await challengeOfTheDayRepo(reponseLastChallengeId);

	return responseRepo;
}
