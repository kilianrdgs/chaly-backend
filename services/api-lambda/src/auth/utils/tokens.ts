import jwt, {
	type Secret,
	type JwtPayload,
	TokenExpiredError,
	JsonWebTokenError,
} from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { HttpError, StatusCode } from "../../globals/http";

const ACCESS_TOKEN_SECRET: Secret =
	process.env.ACCESS_TOKEN_SECRET || "access_secret_key";
const REFRESH_TOKEN_SECRET: Secret =
	process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "90d";

interface CustomTokenPayload extends JwtPayload {
	tokenType: "access" | "refresh";
	sub: string;
	jti: string;
}

// Génère un AccessToken
export function generateAccessToken(userId: number): string {
	const jti = uuidv4();
	return jwt.sign(
		{
			tokenType: "access",
			jti,
			sub: String(userId),
		},
		ACCESS_TOKEN_SECRET,
		{
			expiresIn: ACCESS_TOKEN_EXPIRES_IN,
		},
	);
}

// Génère un refresh token
export function generateRefreshToken(userId: number): string {
	const jti = uuidv4();
	return jwt.sign(
		{
			tokenType: "refresh",
			jti,
			sub: String(userId),
		},
		REFRESH_TOKEN_SECRET,
		{
			expiresIn: REFRESH_TOKEN_EXPIRES_IN,
		},
	);
}

// Vérifie et décode un token (AccessToken ou RefreshToken)
export function verifyToken(
	token: string,
	isRefreshToken = false,
): CustomTokenPayload {
	const secret: Secret = isRefreshToken
		? REFRESH_TOKEN_SECRET
		: ACCESS_TOKEN_SECRET;
	try {
		return jwt.verify(token, secret) as CustomTokenPayload;
	} catch (err: unknown) {
		const error = err as Error;
		if (error.name === "TokenExpiredError") {
			throw new HttpError(
				StatusCode.Unauthorized,
				"TOKEN_EXPIRED",
				"Token expiré",
			);
		}
		if (error.name === "JsonWebTokenError") {
			throw new HttpError(
				StatusCode.Unauthorized,
				"TOKEN_INVALID",
				"Token invalide",
			);
		}
		throw new HttpError(
			StatusCode.Unauthorized,
			"TOKEN_INVALID",
			"erreur serveur",
		);
	}
}
