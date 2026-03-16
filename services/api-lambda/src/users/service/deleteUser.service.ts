import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { deleteUserRepo } from "../repository/deleteUser.repo";

export async function deleteUserService(deps: ServiceDeps, userId: number) {
	const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

	const userCuites = await deps.cuiteRepo.getAllCuiteForUser(userId);
	if (userCuites instanceof CustomError) {
		return userCuites;
	}

	await Promise.all(
		userCuites
			.filter((cuite) => cuite.ImageUrl)
			.map(async (cuite) => {
				const key = cuite.ImageUrl?.split("amazonaws.com/")[1];
				if (key) await deps.s3Service.deleteFile(bucket, key);
			}),
	);

	const deleteCuiteResult = await deps.cuiteRepo.deleteAllCuiteForUser(userId);
	if (deleteCuiteResult instanceof CustomError) {
		return deleteCuiteResult;
	}
	return await deleteUserRepo(userId);
}
