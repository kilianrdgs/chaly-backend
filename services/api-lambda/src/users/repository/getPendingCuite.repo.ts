import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export interface PendingCuite {
	Id: number;
	ImageUrl: string;
	Created_at: Date;
	Titre?: string | null;
	Description?: string | null;
	isAnalyzed: boolean;
}

export async function getPendingCuiteRepo(
	userId: number,
): Promise<PendingCuite | null | CustomError> {
	try {
		const pendingCuite = await prisma.cuites.findFirst({
			where: {
				Id_User: userId,
				IsPublished: false,
			},
			select: {
				Id: true,
				ImageUrl: true,
				Created_at: true,
				Titre: true,
				Description: true,
				isAnalyzed: true,
			},
			orderBy: {
				Created_at: "desc",
			},
		});

		if (!pendingCuite) {
			return null;
		}

		if (!pendingCuite.ImageUrl) {
			return null;
		}

		return {
			Id: pendingCuite.Id,
			ImageUrl: pendingCuite.ImageUrl,
			Created_at: pendingCuite.Created_at,
			Titre: pendingCuite.Titre,
			Description: pendingCuite.Description,
			isAnalyzed: pendingCuite.isAnalyzed,
		};
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de la pending cuite. Erreur:",
			error,
		);
		return new CustomError(
			"Erreur lors de la récupération de la pending cuite.",
			StatusCodeEnum.InternalServerError,
		);
	}
}
