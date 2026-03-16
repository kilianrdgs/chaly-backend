import { prisma } from "../../globals/bdd";

export default async function countWinsRepo(userId: number): Promise<number> {
  const winningCuites = await prisma.challenges.findMany({
    where: {
      WinnerCuiteId: { not: null },
    },
    select: {
      WinnerCuiteId: true,
    },
  });

  const cuiteIds = winningCuites
    .map((c) => c.WinnerCuiteId)
    .filter(Boolean) as number[];

  if (cuiteIds.length === 0) return 0;

  return prisma.cuites.count({
    where: {
      Id: { in: cuiteIds },
      Id_User: userId,
    },
  });
}
