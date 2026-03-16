import countWinsRepo from "../../challenges/repository/countWins.repo";
import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import type { CuiteScrollData } from "../models/cuiteScroll.model";
import type { ScrollResultData } from "../models/scrollResult";
import { decodeCursor, encodeCursor } from "../utils/nextCursor";
import { CuitesRepository } from "./cuitesRepository";

export async function getCuitesListRepo(
  limit: number,
  cursor: string | null,
  type: string,
  userId: number,
  cuiteId?: number | null,
  reponseLastChallengeId?: number
) {
  try {
    let prismaCursor: { Id: number; Created_at: Date } | null = null;

    // Si on reçoit un cuiteId (ex: depuis une notification), on s'en sert comme point d'ancrage
    if (cuiteId) {
      const cuite = await prisma.cuites.findUnique({
        where: { Id: cuiteId },
        select: { Id: true, Created_at: true, Id_Challenge: true },
      });

      if (!cuite) {
        return new CustomError("Cuite introuvable", StatusCodeEnum.NotFound);
      }

      prismaCursor = { Id: cuite.Id, Created_at: cuite.Created_at };
    } else if (cursor && cursor !== "null") {
      const { id, createdAt } = decodeCursor(cursor);
      prismaCursor = { Id: id, Created_at: new Date(createdAt) };
    }

    const whereCondition =
      type === "profile"
        ? { Id_User: userId }
        : reponseLastChallengeId
        ? { Id_Challenge: reponseLastChallengeId }
        : {};

    const totalCuites = await prisma.cuites.count({
      where: whereCondition,
    });

    const cuites = await prisma.cuites.findMany({
      take: limit,
      orderBy: [{ Created_at: "desc" }, { Id: "desc" }],
      ...(prismaCursor && {
        cursor: prismaCursor,
        // ⚠️ Pas de `skip: 1` car on veut INCLURE la cuite de départ
      }),
      where: whereCondition,
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
        User: {
          select: {
            Pseudo: true,
            PhotoUrl: true,
            IsCertified: true,
          },
        },
        Id_Challenge: true,
      },
    });

    const cuiteIds = cuites.map((c) => c.Id);
    const userIds = [...new Set(cuites.map((c) => c.Id_User))];

    const userWinsMap = new Map<number, number>();

    await Promise.all(
      userIds.map(async (uId) => {
        const wins = await countWinsRepo(uId);
        userWinsMap.set(uId, wins);
      })
    );

    const [likesCount, commentsCount, likedByUser] = await Promise.all([
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
        where: {
          Id_User: userId,
          Id_Cuite: { in: cuiteIds },
        },
        select: { Id_Cuite: true },
      }),
    ]);

    const likedSet = new Set(likedByUser.map((like) => like.Id_Cuite));

    // Calculer les streakDays pour chaque utilisateur
    const cuitesRepository = new CuitesRepository();
    const userStreakMap = new Map<number, number>();

    await Promise.all(
      userIds.map(async (uId) => {
        const stats = await cuitesRepository.getUserStats(uId);
        if (!(stats instanceof CustomError)) {
          userStreakMap.set(uId, stats.streakDays);
        }
      })
    );

    const last = cuites[cuites.length - 1];
    const nextCursor =
      cuites.length === limit ? encodeCursor(last.Id, last.Created_at) : null;

    const cuitesScroll = cuites.map((cuite) => {
      const like = likesCount.find((l) => l.Id_Cuite === cuite.Id);
      const comment = commentsCount.find((c) => c.Id_Cuite === cuite.Id);
      const cuiteScrollData: CuiteScrollData = {
        Id: cuite.Id,
        Titre: cuite.Titre,
        UserPseudo: cuite.User.Pseudo,
        Description: cuite.Description,
        CuiteDate: cuite.Created_at,
        UrlPicture: cuite.ImageUrl || "",
        UserPicture: cuite.User.PhotoUrl || undefined,
        LikeCount: like?._count || 0,
        LikedByMe: likedSet.has(cuite.Id),
        CommentCount: comment?._count || 0,
        IsCertified: cuite.User.IsCertified,
        Id_Challenge: cuite.Id_Challenge,
        StreakDays: userStreakMap.get(cuite.Id_User) || 0,
        Address: cuite.Address || null,
        IsBlurred: cuite.IsBlurred,
        IsDaily: cuite.IsDaily,
        WinsCount: userWinsMap.get(cuite.Id_User) || 0,
      };

      return cuiteScrollData;
    });
    const scrollResultData: ScrollResultData = {
      cuites: cuitesScroll,
      cursor: nextCursor,
      nbOfCuites: totalCuites,
    };
    return scrollResultData;
  } catch (error) {
    console.error("Erreur dans getCuitesList:", error);
    return new CustomError(
      "Erreur dans getCuitesList",
      StatusCodeEnum.InternalServerError
    );
  }
}
