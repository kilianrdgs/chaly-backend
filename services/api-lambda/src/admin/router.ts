import express from "express";
import { createDailyChallengeController } from "./controller/createDailyChallenge.controller";

require("dotenv").config();

const adminRouter = express.Router();
const ENV = process.env.ENV;

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API pour les opérations administratives
 */

// ROUTES AUTH
adminRouter.post("/daily-challenge", createDailyChallengeController());

export default adminRouter;
