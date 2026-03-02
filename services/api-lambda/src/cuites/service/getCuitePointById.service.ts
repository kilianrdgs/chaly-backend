// cuites/service/getCuitePointById.service.ts
import CustomError from "../../globals/customError";
import { getCuitePointByIdRepo } from "../repository/getCuitePointById.repo";
import type { ServiceDeps } from "./types";

export async function getCuitePointByIdService(
	deps: ServiceDeps,
	idCuite: number,
) {
	const { s3Service } = deps;
	const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

	const cuitePoint = await getCuitePointByIdRepo(idCuite);
	if (cuitePoint instanceof CustomError) return cuitePoint;

	if (!cuitePoint.Photo) return cuitePoint;

	const photoKey = cuitePoint.Photo.split("amazonaws.com/")[1];
	if (photoKey) {
		cuitePoint.Photo = await s3Service.getSignedImageUrl(bucket, photoKey);
	}
	return cuitePoint;
}
