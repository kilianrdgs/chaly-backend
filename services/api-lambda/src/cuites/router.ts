import express from "express";

import S3Service from "../communication/s3Service";
import { upload } from "../globals/utils/upload";
import { createCuiteController } from "./controller/createCuite.controller";
import { deleteCuiteController } from "./controller/deleteCuite.controller";
import { getCuiteByIdController } from "./controller/getCuiteById.controller";
import { getCuitesListController } from "./controller/getCuitesList.controller";
import { CuitesRepository } from "./repository/cuitesRepository";
import type { ServiceDeps } from "./service/types";

const cuiteRouter = express.Router();
const cuitesRepository = new CuitesRepository();
const s3Service = new S3Service();

const deps: ServiceDeps = {
  cuiteRepo: cuitesRepository,
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
cuiteRouter.get("/:id", getCuiteByIdController(deps));
cuiteRouter.delete("/:id", deleteCuiteController(deps));

export default cuiteRouter;
