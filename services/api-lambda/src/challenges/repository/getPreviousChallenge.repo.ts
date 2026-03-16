import { prisma } from "../../globals/bdd";

export async function getPreviousChallengeRepo() {
  const previous = await prisma.challenges.findFirst({
    where: {
      Post_EndAt: {
        lt: new Date(),
      },
    },
    orderBy: {
      Post_EndAt: "desc",
    },
    select: {
      Id: true,
    },
  });

  if (!previous) {
    throw new Error("Aucun challenge précédent trouvé.");
  }
  return previous.Id;
}
