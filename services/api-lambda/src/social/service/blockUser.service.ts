import CustomError from "../../globals/customError";
import { blockUserRepo } from "../repository/blockUser.repo";

export async function blockUserService(blockerId: number, blockedId: number) {
	// Prevent user from blocking themselves
	if (blockerId === blockedId) {
		return {
			success: false,
			message: "Vous ne pouvez pas vous bloquer vous-même",
		};
	}

	const result = await blockUserRepo(blockerId, blockedId);
	if (result instanceof CustomError) return result;

	return result;
}
