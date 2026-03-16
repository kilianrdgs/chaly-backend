import { prisma } from "../../globals/bdd";
import { getChalyDay } from "../../utils/chalyDay";

export async function getDailyPostingState(userId: number) {
  const chalyDay = getChalyDay();

  try {
    const postsToday = await prisma.cuites.count({
      where: {
        Id_User: userId,
        ChalyDay: chalyDay,
      },
    });

    return {
      hasPostedToday: postsToday >= 1,
      hasPostedTwice: postsToday >= 2,
    };
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'état de publication quotidienne pour l'utilisateur ${userId}. Erreur:`,
      error
    );
    throw error;
  }
}
