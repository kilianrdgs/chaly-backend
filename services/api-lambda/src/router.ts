import "dotenv/config";
import { Router } from "express";
import adminRouter from "./admin/router";
import challengeRouter from "./challenges/router";
import cuiteRouter from "./cuites/router";
import healthRouter from "./health/router";
import { apiKeyMiddleware } from "./middlewares/apiKeyMiddleware";
import { authenticateToken } from "./middlewares/authenticateToken";
import notificationRouter from "./notifications/router";
import socialRouter from "./social/router";
import userRouter from "./users/router";
import { trackActivity } from "./middlewares/trackActivity";
import popupRouter from "./popup/router";
import appRouter from "./app/router";

const globalRouter = Router();

globalRouter.use("/health", healthRouter);
globalRouter.use(
  "/app",
  apiKeyMiddleware,
  authenticateToken,
  trackActivity(),
  appRouter
);
globalRouter.use(
  "/users",
  apiKeyMiddleware,
  authenticateToken,
  trackActivity(),
  userRouter
);
globalRouter.use(
  "/cuites",
  apiKeyMiddleware,
  authenticateToken,
  trackActivity(),
  cuiteRouter
);
globalRouter.use("/challenges", apiKeyMiddleware, challengeRouter);
globalRouter.use("/notifications", apiKeyMiddleware, notificationRouter);
globalRouter.use(
  "/social",
  apiKeyMiddleware,
  authenticateToken,
  trackActivity(),
  socialRouter
);

globalRouter.use("/popup", apiKeyMiddleware, authenticateToken, popupRouter);

globalRouter.use("/admin", adminRouter);

export default globalRouter;
