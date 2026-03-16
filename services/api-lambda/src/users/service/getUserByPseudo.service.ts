import type { ServiceDeps } from "../../cuites/service/types";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { getIdByPseudoRepo } from "../repository/getIdByPseudo";
import { getUserInformationRepo } from "../repository/getUserInformation.repo";
import type { UserDto } from "./models/userDto";

export async function getUserByPseudoService(
	deps: ServiceDeps,
	pseudo: string,
): Promise<UserDto | StatusCodeEnum.Unauthorized | CustomError> {
	const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

	const targetUserId = await getIdByPseudoRepo(pseudo);
	if (targetUserId instanceof CustomError) return targetUserId;
	if (!targetUserId) {
		return new CustomError("User not found", StatusCodeEnum.NotFound);
	}

	const userData = await getUserInformationRepo(targetUserId);
	if (userData instanceof CustomError) {
		return userData;
	}

	let photoUrl = userData.PhotoUrl;
	if (photoUrl) {
		photoUrl = await deps.s3Service.getSignedImageUrl(
			bucket,
			photoUrl.split("amazonaws.com/")[1],
		);
	}

	const resultUserStats = await deps.cuiteRepo.getUserStats(targetUserId);
	if (resultUserStats instanceof CustomError) {
		return resultUserStats;
	}

	return {
		...userData,
		PhotoUrl: photoUrl,
		stats: resultUserStats,
	};
}
