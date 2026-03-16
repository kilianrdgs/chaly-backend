import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import S3Service from "../../communication/s3Service";

const bucketName = process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut";

export async function deleteCommentRepo(commentId: number, userId: number) {
	try {
		const comment = await prisma.comments.findUnique({
			where: { Id: commentId },
		});

		if (!comment) {
			return new CustomError(
				`Commentaire non trouvé pour l'id ${commentId}`,
				StatusCodeEnum.NotFound,
			);
		}

		if (comment.Id_User !== userId) {
			return new CustomError(
				"Vous n'êtes pas autorisé à supprimer ce commentaire",
				StatusCodeEnum.Unauthorized,
			);
		}

		// Supprimer l'image de S3 si elle existe
		if (comment.ImageUrl) {
			try {
				const s3Service = new S3Service();
				const key = comment.ImageUrl.split("amazonaws.com/")[1];
				if (key) {
					await s3Service.deleteFile(bucketName, key);
					console.log(`Image S3 supprimée: ${key}`);
				}
			} catch (error) {
				console.error("Erreur lors de la suppression de l'image S3:", error);
				// On continue même si la suppression S3 échoue
			}
		}

		await prisma.comments.delete({
			where: { Id: commentId },
		});

		// Retourner le cuiteId pour pouvoir récupérer les compteurs mis à jour
		return comment.Id_Cuite;
	} catch (error) {
		console.error("Erreur lors de la suppression du commentaire", error);
		return new CustomError(
			"Erreur lors de la suppression du commentaire",
			StatusCodeEnum.InternalServerError,
		);
	}
}
