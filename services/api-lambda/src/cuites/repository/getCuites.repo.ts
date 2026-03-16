import { prisma } from "../../globals/bdd";

export async function findCuites({
  limit,
  cursor,
  where,
}: {
  limit: number;
  cursor?: { Id: number; Created_at: Date } | null;
  where: any;
}) {
  return prisma.cuites.findMany({
    take: limit,
    orderBy: [{ Created_at: "desc" }, { Id: "desc" }],
    ...(cursor && { cursor }),
    where,
    select: {
      Id: true,
      Titre: true,
      Description: true,
      Created_at: true,
      ImageUrl: true,
      Id_User: true,
      Address: true,
      IsBlurred: true,
      IsDaily: true,
      Id_Challenge: true,
      User: {
        select: {
          Pseudo: true,
          PhotoUrl: true,
          IsCertified: true,
        },
      },
    },
  });
}
