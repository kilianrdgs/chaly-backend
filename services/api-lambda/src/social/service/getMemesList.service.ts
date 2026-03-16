import CustomError from "../../globals/customError";
import { getMemesListRepo } from "../repository/getMemesList.repo";

export async function getMemesListService(
	limit: number,
	cursor: string | null,
	userId?: number | null,
) {
	const result = await getMemesListRepo(limit, cursor, userId);

	if (result instanceof CustomError) {
		return result;
	}

	return result;
}
