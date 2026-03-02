import type { ServiceDeps } from "../../cuites/service/types";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { getPhotoRepo } from "../repository/getPhoto.repo";
import { updatePhotoRepo } from "../repository/updatePhoto.repo";

export async function updatePhotoService(
	deps: ServiceDeps,
	userId: number,
	file: Express.Multer.File,
	fileExtension: string,
) {
	const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

	const imageUser = getPhotoRepo(userId);
	if (imageUser instanceof String) {
		const key = imageUser.split("amazonaws.com/")[1];
		await deps.s3Service.deleteFile(bucket, key);
	}
	if (
		imageUser instanceof CustomError &&
		imageUser.StatusCode !== StatusCodeEnum.NoContent
	) {
		return imageUser;
	}
	const uniqueKey = `users/${Date.now()}-${Math.random()
		.toString(36)
		.substring(2, 15)}${fileExtension}`;
	const uploadResult = await deps.s3Service.uploadFileToS3(
		file,
		bucket,
		uniqueKey,
	);
	await updatePhotoRepo(uploadResult, userId);
}
