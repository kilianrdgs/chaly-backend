import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getLikesRepo(cuiteId: number) {
	try {
		const cuite = await prisma.cuites.findUnique({
			where: { Id: cuiteId },
			select: { Id: true },
		});

		if (!cuite) {
			return new CustomError(
				`Cuite non trouvée pour l'cuiteId ${cuiteId}`,
				StatusCodeEnum.NotFound,
			);
		}

		const [count, likes] = await prisma.$transaction([
			prisma.likes.count({ where: { Id_Cuite: cuiteId } }),
			prisma.likes.findMany({
				where: { Id_Cuite: cuiteId },
				orderBy: { Created_At: "desc" },
				select: {
					User: {
						select: {
							Id: true,
							Pseudo: true,
							PhotoUrl: true,
						},
					},
				},
			}),
		]);

		const users = likes.map((l) => ({
			Id: l.User.Id,
			Pseudo: l.User.Pseudo,
			UserPicture: l.User.PhotoUrl,
		}));

		return { count, users };
	} catch (error) {
		console.error("Erreur lors de la récupération des likes", error);
		return new CustomError(
			"Erreur lors de la récupération des likes",
			StatusCodeEnum.InternalServerError,
		);
	}
}
