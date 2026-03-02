import "dotenv/config";
import { Router } from "express";
import adminRouter from "./admin/router";
import authRouter from "./auth/router";
import challengeRouter from "./challenges/router";
import cuiteRouter from "./cuites/router";
import healthRouter from "./health/router";
import { apiKeyMiddleware } from "./middlewares/apiKeyMiddleware";
import { authenticateToken } from "./middlewares/authenticateToken";
import { touchLastActive } from "./middlewares/touchLastActive";
import notificationRouter from "./notifications/router";
import pictureRouter from "./pictures/router";
import socialRouter from "./social/router";
import userRouter from "./users/router";

const ENV = process.env.ENV ?? "DEV";

const globalRouter = Router();

globalRouter.use("/health", healthRouter);
globalRouter.use("/auth", apiKeyMiddleware, authRouter);
globalRouter.use(
	"/users",
	apiKeyMiddleware,
	authenticateToken,
	touchLastActive(),
	userRouter,
);
globalRouter.use(
	"/cuites",
	apiKeyMiddleware,
	authenticateToken,
	touchLastActive(),
	cuiteRouter,
);
globalRouter.use("/pictures", apiKeyMiddleware, pictureRouter);
globalRouter.use("/challenges", apiKeyMiddleware, challengeRouter);
globalRouter.use("/notifications", apiKeyMiddleware, notificationRouter);
globalRouter.use(
	"/social",
	apiKeyMiddleware,
	authenticateToken,
	touchLastActive(),
	socialRouter,
);
if (ENV === "DEV") {
	globalRouter.use("/admin", adminRouter);
}

export default globalRouter;
