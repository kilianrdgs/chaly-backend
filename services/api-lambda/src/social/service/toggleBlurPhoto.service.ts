import CustomError from "../../globals/customError";
import { toggleBlurPhotoRepo } from "../repository/toggleBlurPhoto.repo";

export async function toggleBlurPhotoService(
	cuiteId: number,
	userId: number,
) {
	const result = await toggleBlurPhotoRepo(cuiteId, userId);
	if (result instanceof CustomError) return result;

	return result;
}
