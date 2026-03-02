import express from "express";
import PushService from "../communication/pushServices";
import S3Service from "../communication/s3Service";
import { CuitesRepository } from "../cuites/repository/cuitesRepository";
import type { ServiceDeps } from "../cuites/service/types";
import { authenticateToken } from "../middlewares/authenticateToken";
import { touchLastActive } from "../middlewares/touchLastActive";
import { createTokenNotificationController } from "./controller/createTokenNotification.controller";
import { cronDailyController } from "./controller/cronDaily.controller";
import { cronNotificationController } from "./controller/cronNotification.controller";
import { deleteTokenNotificationController } from "./controller/deleteTokenNotification.controller";
import { sendNotificationController } from "./controller/sendNotification.controller";

const notificationRouter = express.Router();

const s3Service = new S3Service();
const pushService = new PushService();
const cuitesRepository = new CuitesRepository();

const deps: ServiceDeps = {
	cuiteRepo: cuitesRepository,
	s3Service,
	pushService: pushService,
	bucketName: process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut",
};

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API pour gérer les notifications push
 */

// POST token notif
// DELETE token notif
// POST send-notif

notificationRouter.post(
	"/",
	authenticateToken,
	touchLastActive(),
	createTokenNotificationController(),
);
notificationRouter.delete(
	"/",
	authenticateToken,
	touchLastActive(),
	deleteTokenNotificationController(deps),
);
notificationRouter.post(
	"/send-notification",
	authenticateToken,
	touchLastActive(),
	sendNotificationController(deps),
);
notificationRouter.get("/cron-daily", cronDailyController());
notificationRouter.post("/cron-notification", cronNotificationController());

export default notificationRouter;
