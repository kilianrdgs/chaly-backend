import { prisma } from "../../globals/bdd";

export async function challengeOfTheDayRepo(reponseLastChallengeId: number) {
	if (!reponseLastChallengeId) {
		return { error: "Id Challenge introuvable" };
	}

	const challenge = await prisma.challenges.findUnique({
		where: { Id: reponseLastChallengeId },
		select: { Start_At: true, End_At: true },
	});

	if (!challenge) {
		return { error: "Challenge introuvable" };
	}

	const now = new Date();
	const remainingMs = Math.max(0, challenge.End_At.getTime() - now.getTime());

	const participants = await prisma.cuites.findMany({
		where: { Id_Challenge: reponseLastChallengeId },
		select: { Id_User: true },
		distinct: ["Id_User"],
	});

	return {
		challengeId: 1,
		startedAt: challenge.Start_At,
		endsAt: challenge.End_At,
		remainingMs,
		participants: participants.length,
	};
}
