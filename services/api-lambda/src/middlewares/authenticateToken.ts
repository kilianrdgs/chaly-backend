import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../auth/utils/tokens";
import { HttpError, StatusCode } from "../globals/http";

export function authenticateToken(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const authHeader = req.headers.authorization;
	const token = authHeader?.startsWith("Bearer")
		? authHeader.substring(7)
		: null;

	if (!token) {
		res.status(StatusCode.Unauthorized).json({ error: "TOKEN_INVALID" });
		return;
	}

	try {
		const decoded = verifyToken(token);
		const numericId = Number(decoded.sub);
		if (!numericId || Number.isNaN(numericId)) {
			res.status(StatusCode.BadRequest).json({ error: "ID_NOT_A_NUMBER" });
			return;
		}

		res.locals.userId = numericId;
		next();
	} catch (err: unknown) {
		if (err instanceof HttpError) {
			if (err.error === "TOKEN_EXPIRED") {
				res.status(StatusCode.Unauthorized).json({ error: "TOKEN_EXPIRED" });
			} else {
				res.status(StatusCode.Unauthorized).json({ error: "TOKEN_INVALID" });
			}
		} else {
			res.status(StatusCode.Unauthorized).json({ error: "TOKEN_INVALID" });
		}
	}
}
