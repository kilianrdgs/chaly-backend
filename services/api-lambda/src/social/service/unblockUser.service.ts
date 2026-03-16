import CustomError from "../../globals/customError";
import { unblockUserRepo } from "../repository/unblockUser.repo";

export async function unblockUserService(
	blockerId: number,
	blockedId: number,
) {
	const result = await unblockUserRepo(blockerId, blockedId);
	if (result instanceof CustomError) return result;

	return result;
}
