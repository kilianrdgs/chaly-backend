import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import { getUsersGlobalPostRepo } from "../repository/getUsersGlobalPost.repo";

export async function getUsersGlobalPostService(
	deps: ServiceDeps,
	limit: number,
	cursor: string | null,
) {
	const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

	const result = await getUsersGlobalPostRepo(limit, cursor);
	if (result instanceof CustomError) return result;
	for (const user of result.users) {
		if (user.photoUrl) {
			try {
				const photoKey = user.photoUrl.split("amazonaws.com/")[1];
				user.photoUrl = await deps.s3Service.getSignedImageUrl(
					bucket,
					photoKey,
				);
			} catch (error) {
				console.error(
					`Erreur lors de la génération de l'URL signée pour l'image: ${user.pseudo}`,
					error,
				);
			}
		}
	}
	return result;
}
