// cuites/service/getCuitesList.service.ts
import { getCurrentChallengeRepo } from "../../challenges/repository/getCurrentChallenge.repo";
import { getPreviousChallengeRepo } from "../../challenges/repository/getPreviousChallenge.repo";
import CustomError from "../../globals/customError";
import { getIdByPseudoRepo } from "../../users/repository/getIdByPseudo";
import { getUsersStats } from "../../users/repository/getUsersStats.repo";
import { CuiteScrollData } from "../models/cuiteScroll.model";
import { ScrollResultData } from "../models/scrollResult";
import { findCuites } from "../repository/getCuites.repo";
import { CuiteDb, getVoteCuitesRepo } from "../repository/getVoteCuites.repo";
import { decodeCursor, encodeCursor } from "../utils/nextCursor";
import { getCuitesSocialData } from "./getCuitesSocial.repo";

function buildPrismaCursor(cursor: string | null) {
  if (!cursor || cursor === "null") return null;
  const { id, createdAt } = decodeCursor(cursor);
  return { Id: id, Created_at: new Date(createdAt) };
}

export async function getCuitesListService(
  limit: number,
  cursor: string | null,
  type: string,
  userId: number,
  pseudo: string | null = null
): Promise<ScrollResultData | CustomError> {
  // 🔁 profil via pseudo
  if (pseudo) {
    const resolvedUserId = await getIdByPseudoRepo(pseudo);
    if (resolvedUserId instanceof CustomError) return resolvedUserId;
    if (!resolvedUserId) return new CustomError("User not found", 404);

    userId = resolvedUserId;
    type = "profile";
  }

  // 🧭 where
  let where: any = {};
  let cuites: CuiteDb[] = [];

  if (type === "profile") {
    where.Id_User = userId;
  } else {
    const lastChallengeId = await getCurrentChallengeRepo();
    if (lastChallengeId) {
      where.Id_Challenge = lastChallengeId;
    }
  }

  // 📦 fetch
  const prismaCursor = buildPrismaCursor(cursor);

  if (type === "vote") {
    const previousChallengeId = await getPreviousChallengeRepo();

    cuites = await getVoteCuitesRepo({
      challengeId: previousChallengeId,
      limit,
    });
  } else {
    cuites = await findCuites({
      limit,
      cursor: prismaCursor,
      where,
    });
  }

  const cuiteIds = cuites.map((c) => c.Id);
  const userIds = [...new Set(cuites.map((c) => c.Id_User))];

  const [social, usersStats] = await Promise.all([
    getCuitesSocialData(cuiteIds, userId),
    getUsersStats(userIds),
  ]);

  // 🧩 mapping FINAL (shape identique à avant)
  const cuitesScroll: CuiteScrollData[] = cuites.map((c) => ({
    Id: c.Id,
    Titre: c.Titre,
    UserPseudo: c.User.Pseudo,
    Description: c.Description,
    CuiteDate: c.Created_at,
    UrlPicture: c.ImageUrl || "",
    UserPicture: c.User.PhotoUrl || undefined,
    LikeCount: social.likesMap.get(c.Id) || 0,
    LikedByMe: social.likedSet.has(c.Id),
    CommentCount: social.commentsMap.get(c.Id) || 0,
    IsCertified: c.User.IsCertified,
    Id_Challenge: c.Id_Challenge,
    StreakDays: usersStats.get(c.Id_User)?.streak || 0,
    Address: c.Address || null,
    IsBlurred: c.IsBlurred,
    IsDaily: c.IsDaily,
    WinsCount: usersStats.get(c.Id_User)?.wins || 0,
  }));

  // 🧭 cursor suivant
  const last = cuites[cuites.length - 1];
  const nextCursor =
    cuites.length === limit && last
      ? encodeCursor(last.Id, last.Created_at)
      : null;

  return {
    cuites: cuitesScroll,
    cursor: nextCursor,
    nbOfCuites: cuites.length,
  };
}
