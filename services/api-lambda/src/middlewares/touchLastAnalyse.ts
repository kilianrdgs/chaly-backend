import type { NextFunction, Request, Response } from "express";
import { prisma } from "../globals/bdd";

export function touchLastAnalyse(windowMs = 1 * 60 * 1000) {
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
					OR: [{ LastAnalyseAt: null }, { LastAnalyseAt: { lt: threshold } }],
				},
				data: { LastAnalyseAt: new Date() },
			})
			.catch(() => {});

		next();
	};
}
