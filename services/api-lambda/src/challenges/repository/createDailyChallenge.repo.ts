import { prisma } from "../../globals/bdd";
import { getChallengeStartAndEnd } from "../utils/getChallengesStartAndEnd";

export async function createDailyChallengeRepo() {
	console.log("Starting creation of daily challenge...");
	const { startUtc, endUtc } = getChallengeStartAndEnd();
	console.log("Creating challenge from", startUtc, "to", endUtc);
	try {
		const newChallenge = await prisma.challenges.create({
			data: {
				Start_At: startUtc,
				End_At: endUtc,
			},
		});
		return newChallenge;
	} catch (error) {
		console.error("Erreur lors de la création du défi quotidien :", error);
		throw error;
	}
}
