import CustomError from "../../globals/customError";
import { updateDescriptionRepo } from "../repository/updateDescription.repo";

export async function updateDescriptionService(
	description: string,
	userId: number,
) {
	const resultUpdate = await updateDescriptionRepo(description, userId);
	if (resultUpdate instanceof CustomError) {
		return resultUpdate;
	}
	return userId;
}
