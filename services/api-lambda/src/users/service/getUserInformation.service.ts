import { getDailyPostingState } from "../../cuites/repository/getDailyPostingState.repo";
import type { ServiceDeps } from "../../cuites/service/types";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { HttpError, StatusCode } from "../../globals/http";
import { getUserInformationRepo } from "../repository/getUserInformation.repo";
import { isPseudoExistRepo } from "../repository/isPseudoExist.repo";

export async function getUserInformationService(
  deps: ServiceDeps,
  userId: number
) {
  const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

  const isPseudoExist = await isPseudoExistRepo(userId);

  const userData = await getUserInformationRepo(userId);
  if (
    userData instanceof CustomError &&
    userData.StatusCode === StatusCodeEnum.NoContent
  ) {
    throw new HttpError(
      StatusCode.Unauthorized,
      "USER_NOT_FOUND",
      "Erreur lors de la récupération de l'utilisateur"
    );
  }

  const dailyPostingState = await getDailyPostingState(userId);

  console.log("Daily Posting State:", dailyPostingState);

  if (userData instanceof CustomError) {
    return userData;
  }

  let photoUrl = userData.PhotoUrl;
  if (photoUrl) {
    photoUrl = await deps.s3Service.getSignedImageUrl(
      bucket,
      photoUrl.split("amazonaws.com/")[1]
    );
  }

  const resultUserStats = await deps.cuiteRepo.getUserStats(userId);
  if (resultUserStats instanceof CustomError) {
    return resultUserStats;
  }

  return {
    user: {
      ...userData,
      PhotoUrl: photoUrl,
      stats: resultUserStats,
    },
    requiresPseudo: !isPseudoExist,
    dailyPostingState,
  };
}
