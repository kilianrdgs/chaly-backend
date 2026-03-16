import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export async function createMemeRepo(userId: number, imageUrl: string) {
	console.log("createMemeRepo called with:", { userId, imageUrl });
	try {
		const meme = await prisma.memes.create({
			data: {
				Id_User: userId,
				ImageUrl: imageUrl,
				IsActive: true,
			},
		});

		return meme;
	} catch (error) {
		console.error("Erreur lors de la création du meme", error);
		return new CustomError(
			"Erreur lors de la création du meme",
			StatusCodeEnum.InternalServerError,
		);
	}
}
