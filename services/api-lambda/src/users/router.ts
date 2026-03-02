import express from "express";
import PushService from "../communication/pushServices";
import S3Service from "../communication/s3Service";
import { CuitesRepository } from "../cuites/repository/cuitesRepository";
import type { ServiceDeps } from "../cuites/service/types";

import { upload } from "../globals/utils/upload";
import { serveurKeyMiddleware } from "../middlewares/apiKeyMiddleware";
import { authenticateToken } from "../middlewares/authenticateToken";
import { deleteUserController } from "./controller/deleteUser.controller";
import { getUserByPseudoController } from "./controller/getUserByPseudo.controller";
import { getUserGlobalPostController } from "./controller/getUserGlobalPost.controller";
import { getUserInformationController } from "./controller/getUserInformation.controller";
import { updateBackgroundColorController } from "./controller/updateBackgroundColor.controller";
import { updateDescriptionController } from "./controller/updateDescription.controller";
import { updatePersonalityModeController } from "./controller/updatePersonalityMode.controller";
import { updatePhotoController } from "./controller/updatePhoto.controller";
import { updatePseudoController } from "./controller/updatePseudo.controller";

const userRouter = express.Router();

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
 *   name: Users
 *   description: API pour la gestion des utilisateurs
 */

userRouter.get("/", getUserInformationController(deps));

userRouter.delete("/", deleteUserController(deps)); // a tester

userRouter.patch("/description", updateDescriptionController(deps));

userRouter.patch("/personality-mode", updatePersonalityModeController());

userRouter.patch(
	"/background-color",

	updateBackgroundColorController(deps),
);

userRouter.patch("/:pseudo", updatePseudoController());
userRouter.get(
	"/global-posts",

	getUserGlobalPostController(deps),
);
userRouter.get("/:pseudo", getUserByPseudoController(deps));

userRouter.post(
	"/photo",

	upload.single("media"),
	updatePhotoController(deps),
);

export default userRouter;
