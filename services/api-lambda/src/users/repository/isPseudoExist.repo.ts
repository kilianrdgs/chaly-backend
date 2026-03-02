import { prisma } from "../../globals/bdd";

export async function isPseudoExistRepo(userId: number): Promise<boolean> {
	try {
		const user = await prisma.users.findUnique({
			where: { Id: userId },
			select: { Pseudo: true },
		});

		return Boolean(user?.Pseudo);
	} catch (error) {
		console.error("Erreur lors de la vérification du pseudo", error);
		throw error;
	}
}
