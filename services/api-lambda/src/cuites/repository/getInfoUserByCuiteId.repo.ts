import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function getInfoUserByCuiteIdRepo(idCuite: number) {
	try {
		const cuite = await prisma.cuites.findUnique({
			where: { Id: idCuite },
			select: {
				Id_User: true,
				User: {
					select: {
						Id: true,
						Pseudo: true,
					},
				},
			},
		});

		if (!cuite || !cuite.User) {
			return new CustomError(
				"Utilisateur non trouvé pour l'id de cuite donné",
				StatusCodeEnum.NotFound,
			);
		}

		return {
			Id_User: cuite.Id_User,
			Username: cuite.User.Pseudo,
		};
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'utilisateur via la cuite:",
			error,
		);
		return new CustomError(
			"Erreur lors de la récupération des informations utilisateur",
			StatusCodeEnum.InternalServerError,
		);
	}
}
