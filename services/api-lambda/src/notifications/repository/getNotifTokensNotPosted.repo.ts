import { prisma } from "../../globals/bdd";

export default async function getNotifTokensNotPostedRepo(challengeId: number) {
	try {
		const users = await prisma.users.findMany({
			where: {
				TokenNotification: { not: null },
				Cuites: { none: { Id_Challenge: challengeId } },
			},
			select: {
				TokenNotification: true,
				Pseudo: true,
			},
		});

		return users
			.filter(
				(u) =>
					typeof u.TokenNotification === "string" &&
					u.TokenNotification.length > 0,
			)
			.map((u) => ({
				TokenNotification: u.TokenNotification as string,
				Pseudo: u.Pseudo,
			}));
	} catch (error) {
		console.error(
			`❌ Erreur lors de la récupération des tokens/pseudos des non-posteurs (challenge ${challengeId}) :`,
			error,
		);
		return [];
	}
}
