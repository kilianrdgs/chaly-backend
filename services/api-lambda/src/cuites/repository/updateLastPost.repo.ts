import { prisma } from "../../globals/bdd";

export async function updateLastPostRepo(userId: number) {
	try {
		await prisma.users.update({
			where: { Id: userId },
			data: { LastPostAt: new Date() },
		});
	} catch (err) {
		console.error("❌ Erreur maj LastPostAt:", err);
	}
}
