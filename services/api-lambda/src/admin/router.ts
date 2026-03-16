import express from "express";
import { createDailyChallengeController } from "./controller/createDailyChallenge.controller";
import { getStatsController } from "./controller/getStats.controller";
import { getAnalyticsStatsController } from "./controller/getAnalyticsStats.controller";
import { getRegistrationStatsController } from "./controller/getRegistrationStats.controller";
import { testController } from "./controller/test.controller";
import { sendNotificationTestController } from "./controller/sendNotificationTest.controller";
import { createPopupController } from "./controller/createPopup.controller";

require("dotenv").config();

const adminRouter = express.Router();
const ENV = process.env.ENV;

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API pour les opérations administratives
 */

// ROUTES ADMINISTRATEUR
adminRouter.get("/get-stats", getStatsController());
adminRouter.post("/analytics/stats", getAnalyticsStatsController());
adminRouter.post("/registration/stats", getRegistrationStatsController());
adminRouter.get("/test", testController());
if (ENV === "DEV") {
  adminRouter.post("/daily-challenge", createDailyChallengeController());
  adminRouter.post("/send-notification", sendNotificationTestController());
  adminRouter.post("/popup", createPopupController());
}

export default adminRouter;
