import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { touchLastAnalyse } from "../middlewares/touchLastAnalyse";
import PicturesController from "./controller/picturesController";
import PicturesService from "./service/picturesService";

const pictureRouter = express.Router();
const pictureService = new PicturesService();
const pictureController = new PicturesController(pictureService);

/**
 * @swagger
 * tags:
 *   name: Pictures
 *   description: API pour gérer les photos
 */

pictureRouter.post(
	"/analyse",
	authenticateToken,
	touchLastAnalyse(),
	pictureController.getUploadMiddleware(),
	(req, res) => pictureController.analyse(req, res),
);

export default pictureRouter;
