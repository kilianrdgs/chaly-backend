import { get } from "node:http";
import express from "express";
import { createDailyChallengeController } from "../admin/controller/createDailyChallenge.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { challengeOfTheDayController } from "./controller/challengeOfTheDay.controller";
import { getDailyChallengeWinnersController } from "./controller/getDailyChallengeWinners.controller";
import { sendDailyChallengeController } from "./controller/sendDailyChallenge.controller";

const challengeRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Challenges
 *   description: API pour gérer les défis
 */

challengeRouter.post("/send-daily", sendDailyChallengeController());
challengeRouter.post("/", createDailyChallengeController);
challengeRouter.get(
	"/challenge-of-the-day",
	authenticateToken,
	challengeOfTheDayController(),
);
challengeRouter.get(
	"/:challengeId/winners",
	getDailyChallengeWinnersController(),
);

export default challengeRouter;
