import { prisma } from "../../globals/bdd";

export type CuiteDb = {
  Id: number;
  Titre: string | null;
  Description: string | null;
  Created_at: Date;
  ImageUrl: string | null;
  Id_User: number;
  Address: string | null;
  IsBlurred: boolean;
  IsDaily: boolean;
  Id_Challenge: number | null;
  User: {
    Pseudo: string | null;
    PhotoUrl: string | null;
    IsCertified: boolean;
  };
};

export async function getVoteCuitesRepo({
  challengeId,
  limit,
}: {
  challengeId: number;
  limit: number;
}): Promise<CuiteDb[]> {
  return prisma.$queryRaw<CuiteDb[]>`
    SELECT 
      c."Id",
      c."Titre",
      c."Description",
      c."Created_at",
      c."ImageUrl",
      c."Id_User",
      c."Address",
      c."IsBlurred",
      c."IsDaily",
      c."Id_Challenge",
      json_build_object(
        'Pseudo', u."Pseudo",
        'PhotoUrl', u."PhotoUrl",
        'IsCertified', u."IsCertified"
      ) AS "User"
    FROM "Cuites" c
    JOIN "Users" u ON u."Id" = c."Id_User"
    WHERE c."Id_Challenge" = ${challengeId}
    AND c."IsDaily" = true
    ORDER BY RANDOM()
    LIMIT ${limit};
  `;
}
