import { getChallengeWinnersRepo } from "../repository/getDailyChallengeWinners.repo";

export async function getDailyChallengeWinnersService(challengeId: string) {
	const numberChallengeId = Number.parseInt(challengeId, 10);

	if (Number.isNaN(numberChallengeId)) {
		throw new Error("Invalid challengeId");
	}

	const responseWinners = await getChallengeWinnersRepo(
		numberChallengeId,
		10,
		3,
	);
	return responseWinners;
}
