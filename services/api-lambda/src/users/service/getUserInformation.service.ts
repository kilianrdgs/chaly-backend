import type { ServiceDeps } from "../../cuites/service/types";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { HttpError, StatusCode } from "../../globals/http";
import { getPendingCuiteRepo } from "../repository/getPendingCuite.repo";
import { getUserInformationRepo } from "../repository/getUserInformation.repo";
import { isPseudoExistRepo } from "../repository/isPseudoExist.repo";

export async function getUserInformationService(
	deps: ServiceDeps,
	userId: number,
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
			"Erreur lors de la récupération de l'utilisateur",
		);
	}
	if (userData instanceof CustomError) {
		return userData;
	}
	if (userData.PhotoUrl) {
		userData.PhotoUrl = await deps.s3Service.getSignedImageUrl(
			bucket,
			userData.PhotoUrl.split("amazonaws.com/")[1],
		);
	}

	const resultUserStats = await deps.cuiteRepo.getUserStats(userId);
	if (resultUserStats instanceof CustomError) {
		return resultUserStats;
	}
	userData.stats = resultUserStats;

	// Récupération de la pendingCuite séparément
	const pendingCuiteResult = await getPendingCuiteRepo(userId);
	const pendingCuite =
		pendingCuiteResult instanceof CustomError ? null : pendingCuiteResult;

	// Générer l'URL signée S3 pour la pendingCuite si elle existe
	if (pendingCuite?.ImageUrl) {
		pendingCuite.ImageUrl = await deps.s3Service.getSignedImageUrl(
			bucket,
			pendingCuite.ImageUrl.split("amazonaws.com/")[1],
		);
	}

	return {
		user: userData,
		requiresPseudo: !isPseudoExist,
		pendingCuite: pendingCuite,
	};
}
