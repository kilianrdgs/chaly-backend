import { prisma } from "../../globals/bdd";

export async function createVoteRepo(
  userId: number,
  cuiteId: number,
  challengeId: number
) {
  try {
    const vote = await prisma.votes.create({
      data: {
        Id_User: userId,
        Id_Cuite: cuiteId,
        ChallengeId: challengeId,
      },
    });
    return vote;
  } catch (error) {
    console.error("Erreur lors de la création du défi quotidien :", error);
    throw error;
  }
}
