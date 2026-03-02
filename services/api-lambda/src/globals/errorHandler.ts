import type { ErrorRequestHandler } from "express";
import { HttpError, StatusCode } from "./http";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	if (err instanceof HttpError) {
		res.status(err.statusCode).json({ error: err.message });
		return;
	}
	res.status(StatusCode.InternalServerError).json({ error: "SERVER_ERROR" });
};
