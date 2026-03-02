import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function createCuiteRepo(
	UserId: number,
	data: {
		Titre?: string | null;
		Description?: string | null;
		CuiteDate: Date;
		ImageUrl?: string | null;
	},
	reponseLastChallengeId?: number,
) {
	try {
		const r = await prisma.cuites.create({
			data: {
				Id_User: UserId,
				Titre: data.Titre ?? undefined,
				Description: data.Description ?? undefined,
				Date: data.CuiteDate,
				ImageUrl: data.ImageUrl ?? undefined,
				Id_Challenge: reponseLastChallengeId ?? null,
				IsPublished: false,
				isAnalyzed: false,
			},
			select: { Id: true },
		});
		return r.Id;
	} catch (e) {
		console.error("createCuiteRepo error:", e);
		return new CustomError(
			"Cuite non insérée en base",
			StatusCodeEnum.InternalServerError,
		);
	}
}
