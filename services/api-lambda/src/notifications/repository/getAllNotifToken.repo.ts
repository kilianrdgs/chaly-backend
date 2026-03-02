import { prisma } from "../../globals/bdd";

export default async function getAllNotifTokenRepo() {
	try {
		const users = await prisma.users.findMany({
			where: {
				TokenNotification: {
					not: null,
				},
			},
			select: {
				TokenNotification: true,
				Pseudo: true,
			},
		});
		return users;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des tokens (de notification) des utilisateurs. Erreur :",
			error,
		);
		return [];
	}
}
