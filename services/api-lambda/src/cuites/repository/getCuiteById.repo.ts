import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import type { CuiteScrollData } from "../models/cuiteScroll.model";
import { CuitesRepository } from "./cuitesRepository";

export async function getCuiteByIdRepo(
  cuiteId: number,
  userId: number
): Promise<CuiteScrollData | CustomError> {
  try {
    const cuite = await prisma.cuites.findUnique({
      where: { Id: cuiteId },
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

    if (!cuite) {
      return new CustomError("Cuite introuvable", StatusCodeEnum.NotFound);
    }

    // Récupérer les statistiques de l'utilisateur
    const cuitesRepository = new CuitesRepository();
    const userStats = await cuitesRepository.getUserStats(cuite.Id_User);
    const streakDays =
      userStats instanceof CustomError ? 0 : userStats.streakDays;

    const [likesCount, commentsCount, likedByUser] = await Promise.all([
      prisma.likes.count({
        where: { Id_Cuite: cuiteId },
      }),
      prisma.comments.count({
        where: { Id_Cuite: cuiteId },
      }),
      prisma.likes.findFirst({
        where: {
          Id_User: userId,
          Id_Cuite: cuiteId,
        },
      }),
    ]);

    const cuiteData: CuiteScrollData = {
      Id: cuite.Id,
      Titre: cuite.Titre,
      UserPseudo: cuite.User.Pseudo,
      Description: cuite.Description,
      CuiteDate: cuite.Created_at,
      UrlPicture: cuite.ImageUrl || "",
      UserPicture: cuite.User.PhotoUrl || undefined,
      LikeCount: likesCount,
      LikedByMe: !!likedByUser,
      CommentCount: commentsCount,
      IsCertified: cuite.User.IsCertified,
      Id_Challenge: cuite.Id_Challenge,
      StreakDays: streakDays,
      Address: cuite.Address || null,
      IsBlurred: cuite.IsBlurred,
      IsDaily: cuite.IsDaily,
      WinsCount: null,
    };

    return cuiteData;
  } catch (error) {
    console.error("Erreur dans getCuiteById:", error);
    return new CustomError(
      "Erreur lors de la récupération de la cuite",
      StatusCodeEnum.InternalServerError
    );
  }
}
