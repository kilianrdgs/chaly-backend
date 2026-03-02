import express from "express";

import PushService from "../communication/pushServices";
import S3Service from "../communication/s3Service";
import { upload } from "../globals/utils/upload";
import { authenticateToken } from "../middlewares/authenticateToken";
import { createCuiteController } from "./controller/createCuite.controller";
import { deleteCuiteController } from "./controller/deleteCuite.controller";
import { getCuitePointByIdController } from "./controller/getCuitePoint.controller";
import { getCuitesListController } from "./controller/getCuitesList.controller";
import { publishPendingCuiteController } from "./controller/publishPendingCuite.controller";
import { updatePendingCuiteController } from "./controller/updatePendingCuite.controller";
import { CuitesRepository } from "./repository/cuitesRepository";
import type { ServiceDeps } from "./service/types";

const cuiteRouter = express.Router();
const cuitesRepository = new CuitesRepository();
const s3Service = new S3Service();
const pushService = new PushService();

const deps: ServiceDeps = {
	cuiteRepo: cuitesRepository,
	pushService: pushService,
	s3Service,
	bucketName: process.env.AWS_S3_BUCKET || "votre-bucket-par-defaut",
};

/**
 * @swagger
 * tags:
 *   name: Cuites
 *   description: API pour gérer les cuites
 */

// Routes concernant les cuites
cuiteRouter.post("/", upload.single("media"), createCuiteController(deps));
cuiteRouter.get("/list", getCuitesListController(deps));
cuiteRouter.delete("/:id", deleteCuiteController(deps));
cuiteRouter.get("/:id", getCuitePointByIdController(deps));
cuiteRouter.patch("/pending", updatePendingCuiteController(deps));
cuiteRouter.patch("/pending/publish", publishPendingCuiteController(deps));

export default cuiteRouter;
