import type { NextFunction, Request, Response } from "express";
import { prisma } from "../globals/bdd";

const ACTIVITY_THROTTLE_MS = 60 * 1000; // 1 log par minute par utilisateur
const lastActivityMap = new Map<number, number>();

export function trackActivity() {
  return async (
    req: Request & { user?: { Id?: number } },
    res: Response,
    next: NextFunction
  ) => {
    const userId = res.locals.userId as number | undefined;
    if (!userId) return next();

    const now = Date.now();
    const lastActivity = lastActivityMap.get(userId);

    if (!lastActivity || now - lastActivity >= ACTIVITY_THROTTLE_MS) {
      lastActivityMap.set(userId, now);

      void prisma.users
        .update({
          where: { Id: userId },
          data: { LastActiveAt: new Date() },
        })
        .catch((err) => console.error("[trackActivity] update failed:", err));

      void prisma.userAnalytics
        .create({
          data: {
            Id_User: userId,
            Action: "ACTIVITY",
            Metadata: {
              path: req.path,
              method: req.method,
              ip: req.ip,
              userAgent: req.headers["user-agent"] ?? "unknown",
            },
          },
        })
        .catch((err) => console.error("[trackActivity] insert failed:", err));
    }

    next();
  };
}
