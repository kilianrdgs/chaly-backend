import CustomError from "../../globals/customError";
import { updatePersonalityModeRepo } from "../repository/updatePersonalityMode.repo";

export async function updatePersonalityModeService(
	personalityMode: string,
	userId: number,
) {
	const resultUpdate = await updatePersonalityModeRepo(personalityMode, userId);
	if (resultUpdate instanceof CustomError) {
		return resultUpdate;
	}
	return userId;
}
