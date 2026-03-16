import { prisma } from "../../globals/bdd";

export async function getCurrentChallengeRepo(): Promise<number> {
  const last = await prisma.challenges.findFirst({
    orderBy: { Id: "desc" },
    select: { Id: true },
  });

  if (!last) {
    throw new Error("Aucun challenge trouvé.");
  }

  return last.Id;
}
