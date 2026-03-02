import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

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
