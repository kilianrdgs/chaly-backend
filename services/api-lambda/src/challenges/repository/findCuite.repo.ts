import { prisma } from "../../globals/bdd";

export default async function findCuiteRepo(
  cuiteId: number,
  challengeId: number
) {
  try {
    return await prisma.cuites.findUnique({
      where: {
        Id: cuiteId,
        Id_Challenge: challengeId,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recherche de la cuite :", error);
    throw error;
  }
}
