import { prisma } from "../../globals/bdd";

export default async function verifyVoteRepo(
  userId: number,
  challengeId: number
) {
  try {
    return await prisma.votes.findFirst({
      where: {
        Id_User: userId,
        ChallengeId: challengeId,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du vote :", error);
    throw error;
  }
}
