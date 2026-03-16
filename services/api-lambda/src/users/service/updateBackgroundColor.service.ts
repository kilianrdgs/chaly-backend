import CustomError from "../../globals/customError";
import { updateBackgroundColorRepo } from "../repository/updateBackgroundColor.repo";

export async function updateBackgroundColorService(
	backgroundColor: string,
	userId: number,
) {
	const resultUpdate = await updateBackgroundColorRepo(backgroundColor, userId);
	if (resultUpdate instanceof CustomError) {
		return resultUpdate;
	}
	return userId;
}
