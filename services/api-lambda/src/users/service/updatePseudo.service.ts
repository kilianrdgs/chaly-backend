import CustomError from "../../globals/customError";
import { updatePseudoRepo } from "../repository/updatePseudo.repo";

export async function updatePseudoService(pseudo: string, userId: number) {
	const resultUpdate = await updatePseudoRepo(pseudo, userId);
	if (resultUpdate instanceof CustomError) {
		return resultUpdate;
	}
	return userId;
}
