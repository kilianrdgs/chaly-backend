import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { getUserRoleRepo } from "../../users/repository/getUserRole.repo";
import type { ServiceDeps } from "../../cuites/service/types";
import {
	deleteMemeRepo,
	getMemeInfoByIdRepo,
} from "../repository/deleteMeme.repo";

export async function deleteMemeService(
	deps: ServiceDeps,
	memeId: number,
	userId: number,
) {
	const { s3Service } = deps;
	const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

	// Récupérer les informations du meme
	const meme = await getMemeInfoByIdRepo(memeId);
	if (meme instanceof CustomError) return meme;

	// Vérifier si l'utilisateur est modérateur
	const isModerator = await getUserRoleRepo(userId);
	if (isModerator instanceof CustomError) return isModerator;

	// Vérifier que l'utilisateur est le propriétaire du meme ou modérateur
	if (meme.Id_User !== userId && !isModerator) {
		return new CustomError(
			"Vous n'êtes pas autorisé à supprimer ce meme",
			StatusCodeEnum.Unauthorized,
		);
	}

	// Supprimer l'image sur S3
	if (typeof meme.ImageUrl === "string") {
		const key = meme.ImageUrl.split("amazonaws.com/")[1];
		if (key) {
			await s3Service.deleteFile(bucket, key);
		}
	}

	// Supprimer le meme de la base de données
	const result = await deleteMemeRepo(memeId);
	if (result instanceof CustomError) return result;

	return { success: true, message: "Meme supprimé avec succès" };
}
