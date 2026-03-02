import { HttpError, StatusCode } from "../../globals/http";
import { invalidateRefreshTokenRepo } from "../repository/invalidateRefreshToken.repo";
import { verifyValidityRefreshTokenRepo } from "../repository/verifyValidityRefreshToken.repo";

export async function logoutService(refreshToken: string) {
	const isValid = await verifyValidityRefreshTokenRepo(refreshToken);
	if (!isValid) {
		throw new HttpError(
			StatusCode.Unauthorized,
			"TOKEN_INVALID",
			"token invalide",
		);
	}

	try {
		await invalidateRefreshTokenRepo(refreshToken);
		return { success: true };
	} catch (error) {
		console.error("Erreur invalidation token:", (error as Error).message);
		throw new HttpError(
			StatusCode.InternalServerError,
			"INTERNAL_SERVER_ERROR",
			"Erreur interne lors de la déconnexion",
		);
	}
}
