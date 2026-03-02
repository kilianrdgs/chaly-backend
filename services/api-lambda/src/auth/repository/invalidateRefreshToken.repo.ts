import { prisma } from "../../globals/bdd";
import type CustomError from "../../globals/customError";
import { StatusCodeEnum } from "../../globals/customError";
import { HttpError, StatusCode } from "../../globals/http";

export async function invalidateRefreshTokenRepo(
	token: string,
): Promise<boolean | CustomError> {
	try {
		await prisma.invalid_Tokens.create({ data: { Token: token } });

		return true;
	} catch {
		throw new HttpError(
			StatusCode.InternalServerError,
			"ERREUR INTERNAL_SERVER_ERROR",
			"Une erreur interne s'est produite",
		);
	}
}
