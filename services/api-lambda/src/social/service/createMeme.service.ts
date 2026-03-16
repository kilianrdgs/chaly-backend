import CustomError from "../../globals/customError";
import { createMemeRepo } from "../repository/createMeme.repo";

export async function createMemeService(userId: number, imageUrl: string) {
	const meme = await createMemeRepo(userId, imageUrl);
	if (meme instanceof CustomError) return meme;

	return {
		success: true,
		meme,
	};
}
