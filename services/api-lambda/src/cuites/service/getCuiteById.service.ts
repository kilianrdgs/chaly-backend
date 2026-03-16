import CustomError from "../../globals/customError";
import { getCuiteByIdRepo } from "../repository/getCuiteById.repo";

export async function getCuiteByIdService(
	cuiteId: number,
	userId: number,
) {
	return await getCuiteByIdRepo(cuiteId, userId);
}
