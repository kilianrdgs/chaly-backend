import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function sendDailyChallengeRepo() {
	try {
		const challenges = await prisma.dailyChallenges.findMany({
			where: { Realized: false },
		});

		if (challenges.length === 0) {
			return new CustomError(
				"Aucun défi actif disponible",
				StatusCodeEnum.NotFound,
			);
		}

		const randomIndex = Math.floor(Math.random() * challenges.length);
		const selectedChallenge = challenges[randomIndex];

		await prisma.dailyChallenges.update({
			where: { Id: selectedChallenge.Id },
			data: {
				Realized: true,
				Used_At: new Date(),
			},
		});
		return {
			sent: 0,
			challengeId: selectedChallenge.Id,
			title: selectedChallenge.Title,
			description: selectedChallenge.Description,
		};
	} catch (error) {
		console.error("Erreur lors de l'envoi du défi quotidien :", error);
		return new CustomError(
			"Erreur lors de l'envoi du défi quotidien",
			StatusCodeEnum.InternalServerError,
		);
	}
}
