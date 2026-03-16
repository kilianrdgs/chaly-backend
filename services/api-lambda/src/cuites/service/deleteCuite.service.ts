// cuites/service/deleteCuite.service.ts
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { getUserRoleRepo } from "../../users/repository/getUserRole.repo";
import {
	deleteCuiteRepo,
	getPictureUrlByCuiteIdRepo,
} from "../repository/deleteCuite.repo";
import type { ServiceDeps } from "./types";

export async function deleteCuiteService(
	deps: ServiceDeps,
	idCuite: number,
	userId: number,
) {
	const { s3Service } = deps;
	const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

	const cuite = await getPictureUrlByCuiteIdRepo(idCuite);
	if (!cuite) {
		return new CustomError("Pas de cuite pour cet id", StatusCodeEnum.NotFound);
	}
	if (cuite instanceof CustomError) return cuite;

	const isModerator = await getUserRoleRepo(userId);
	if (isModerator instanceof CustomError) return isModerator;

	if (cuite.Id_User !== userId && !isModerator) {
		return new CustomError(
			"Ce n'est pas votre cuite",
			StatusCodeEnum.Unauthorized,
		);
	}

	if (typeof cuite.Url_Picture === "string") {
		const key = cuite.Url_Picture.split("amazonaws.com/")[1];
		if (key) await s3Service.deleteFile(bucket, key);
	}

	return deleteCuiteRepo(idCuite);
}
