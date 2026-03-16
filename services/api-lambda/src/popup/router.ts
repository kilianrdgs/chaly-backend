import express from "express";
import { getPopupController } from "./controller/getPopup.controller";
import { seenPopupController } from "./controller/seenPopup.controller";

const popupRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Popup
 *   description: API pour gérer les popups
 */

popupRouter.get("/", getPopupController());
popupRouter.post("/seen", seenPopupController());

export default popupRouter;
