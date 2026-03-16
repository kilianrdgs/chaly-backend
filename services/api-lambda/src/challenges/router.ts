import express from "express";
import { createDailyChallengeController } from "../admin/controller/createDailyChallenge.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { getDailyChallengeWinnersController } from "./controller/getDailyChallengeWinners.controller";
import { createVoteController } from "./controller/createVote.controller";
import { getVoteStatsController } from "./controller/getVoteStats.controller";

const challengeRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Challenges
 *   description: API pour gérer les défis
 */

challengeRouter.post("/", createDailyChallengeController);
challengeRouter.get(
  "/:challengeId/winners",
  getDailyChallengeWinnersController()
);
challengeRouter.post("/vote", authenticateToken, createVoteController());

challengeRouter.get("/:challengeId/votes/stats", getVoteStatsController());

export default challengeRouter;
