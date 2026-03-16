import jwt, { type Secret, type JwtPayload } from "jsonwebtoken";
import { HttpError, StatusCode } from "../globals/http";

const ACCESS_TOKEN_SECRET: Secret =
  process.env.ACCESS_TOKEN_SECRET || "access_secret_key";
const REFRESH_TOKEN_SECRET: Secret =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key";

interface CustomTokenPayload extends JwtPayload {
  tokenType: "access" | "refresh";
  sub: string;
  jti: string;
}

// Vérifie et décode un token (AccessToken ou RefreshToken)
export function verifyToken(
  token: string,
  isRefreshToken = false
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
        "Token expiré"
      );
    }
    if (error.name === "JsonWebTokenError") {
      throw new HttpError(
        StatusCode.Unauthorized,
        "TOKEN_INVALID",
        "Token invalide"
      );
    }
    throw new HttpError(
      StatusCode.Unauthorized,
      "TOKEN_INVALID",
      "erreur serveur"
    );
  }
}
