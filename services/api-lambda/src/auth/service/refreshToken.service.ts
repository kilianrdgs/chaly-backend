import { HttpError, StatusCode } from "../../globals/http";
import { invalidateRefreshTokenRepo } from "../repository/invalidateRefreshToken.repo";
import { verifyValidityRefreshTokenRepo } from "../repository/verifyValidityRefreshToken.repo";

import {
	generateAccessToken,
	generateRefreshToken,
	verifyToken,
} from "../utils/tokens";

type Tokens = { accessToken: string; refreshToken: string };

export async function refreshTokenService(
	refreshToken: string,
): Promise<Tokens> {
	const isValid = await verifyValidityRefreshTokenRepo(refreshToken);
	if (!isValid) {
		throw new HttpError(
			StatusCode.Unauthorized,
			"TOKEN_INVALID",
			"token invalide",
		);
	}

	// 2. Vérifier le refresh token et extraire payload
	let payload: { sub: string; tokenType: string };
	try {
		payload = verifyToken(refreshToken, true);

		if (payload.tokenType !== "refresh") {
			throw new HttpError(
				StatusCode.BadRequest,
				"TOKEN_INVALID",
				"token invalide",
			);
		}
	} catch (err: unknown) {
		const name = (err as { name?: string }).name;
		if (name === "TokenExpiredError") {
			throw new HttpError(
				StatusCode.Unauthorized,
				"TOKEN_EXPIRED",
				"token expiré",
			);
		}
		throw new HttpError(
			StatusCode.Unauthorized,
			"TOKEN_INVALID",
			"token invalide",
		);
	}

	const userId = Number(payload.sub);
	if (Number.isNaN(userId)) {
		throw new HttpError(
			StatusCode.Unauthorized,
			"TOKEN_INVALID",
			"sub token invalide",
		);
	}

	// 3. Invalider l'ancien refresh token (idempotent)
	try {
		await invalidateRefreshTokenRepo(refreshToken);
	} catch (error) {
		// Log l’erreur mais ne bloque pas la génération des nouveaux tokens
		console.error(
			"Erreur lors de l'invalidation du refresh token:",
			(error as Error).message || error,
		);
	}

	// 4. Générer de nouveaux tokens
	const accessToken = generateAccessToken(userId);
	const newRefreshToken = generateRefreshToken(userId);

	return {
		accessToken,
		refreshToken: newRefreshToken,
	};
}
