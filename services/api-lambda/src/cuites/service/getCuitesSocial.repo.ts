import { prisma } from "../../globals/bdd";

export async function getCuitesSocialData(cuiteIds: number[], userId: number) {
  const [likes, comments, likedByUser] = await Promise.all([
    prisma.likes.groupBy({
      by: ["Id_Cuite"],
      where: { Id_Cuite: { in: cuiteIds } },
      _count: true,
    }),
    prisma.comments.groupBy({
      by: ["Id_Cuite"],
      where: { Id_Cuite: { in: cuiteIds } },
      _count: true,
    }),
    prisma.likes.findMany({
      where: { Id_User: userId, Id_Cuite: { in: cuiteIds } },
      select: { Id_Cuite: true },
    }),
  ]);

  return {
    likesMap: new Map(likes.map((l) => [l.Id_Cuite, l._count])),
    commentsMap: new Map(comments.map((c) => [c.Id_Cuite, c._count])),
    likedSet: new Set(likedByUser.map((l) => l.Id_Cuite)),
  };
}
