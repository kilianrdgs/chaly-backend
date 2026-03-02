import { prisma } from "../../globals/bdd";
import type CustomError from "../../globals/customError";
import { StatusCodeEnum } from "../../globals/customError";
import { HttpError, StatusCode } from "../../globals/http";

export async function verifyValidityRefreshTokenRepo(
	token: string,
): Promise<boolean | CustomError> {
	try {
		const invalidedToken = await prisma.invalid_Tokens.findUnique({
			where: { Token: token },
		});
		if (invalidedToken) {
			return false;
		}

		return true;
	} catch (error) {
		throw new HttpError(
			StatusCode.InternalServerError,
			"ERREUR SERVEUR",
			"Une erreur interne s'est produite",
		);
	}
}
