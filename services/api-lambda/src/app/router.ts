import express from "express";
import { getAppStateController } from "./controller/getAppState.controller";

/**
 * @swagger
 * tags:
 *   name: App
 *   description: API pour gérer l'état de l'application
 */

const appRouter = express.Router();

appRouter.get("/app-state", getAppStateController());

export default appRouter;
