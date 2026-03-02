import type { NextFunction, Request, Response } from "express";
import { prisma } from "../globals/bdd";

export function touchLastActive(windowMs = 5 * 60 * 1000) {
	return (
		_req: Request & { user?: { Id?: number } },
		res: Response,
		next: NextFunction,
	) => {
		const userId = res.locals.userId as number | undefined;
		if (!userId) return next();

		const threshold = new Date(Date.now() - windowMs);

		void prisma.users
			.updateMany({
				where: {
					Id: userId,
					OR: [{ LastActiveAt: null }, { LastActiveAt: { lt: threshold } }],
				},
				data: { LastActiveAt: new Date() },
			})
			.catch(() => {});

		next();
	};
}
