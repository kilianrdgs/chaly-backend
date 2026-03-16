import express from "express";

import S3Service from "../communication/s3Service";
import { CuitesRepository } from "../cuites/repository/cuitesRepository";
import type { ServiceDeps } from "../cuites/service/types";
import { upload } from "../globals/utils/upload";
import { blockUserController } from "./controller/blockUser.controller";
import { createCommentController } from "./controller/createComment.controller";
import { deleteCommentController } from "./controller/deleteComment.controller";
import { getCommentsController } from "./controller/getComments.controller";
import { getLikesController } from "./controller/getLikes.controller";
import { likeCuiteController } from "./controller/likeCuite.controller";
import { toggleBlurPhotoController } from "./controller/toggleBlurPhoto.controller";
import { unblockUserController } from "./controller/unblockUser.controller";
import { unlikeCuiteController } from "./controller/unlikeCuite.controller";
import { createMemesController } from "./controller/createMemes.controller";
import { getMemesListController } from "./controller/getMemesList.controller";
import { deleteMemeController } from "./controller/deleteMeme.controller";

const socialRouter = express.Router();

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
 *   name: Social
 *   description: API pour gérer les actions sociales
 */

// Routes concernant les commentaires
socialRouter.get("/cuites/:cuiteId/comments", getCommentsController(deps));
socialRouter.post(
  "/cuites/:cuiteId/comment",
  upload.single("media"),
  createCommentController(deps)
);
socialRouter.delete(
  "/cuites/:commentId/comment",
  deleteCommentController(deps)
);

// Likes
socialRouter.get("/cuites/:cuiteId/likes", getLikesController(deps));
socialRouter.post("/cuites/:cuiteId/like", likeCuiteController);
socialRouter.delete("/cuites/:cuiteId/like", unlikeCuiteController);

// Blocage d'utilisateurs
socialRouter.post("/users/:userId/block", blockUserController);
socialRouter.delete("/users/:userId/block", unblockUserController);

// Toggle blur photo
socialRouter.patch("/cuites/:cuiteId/blur", toggleBlurPhotoController);

// memes
socialRouter.get("/memes", getMemesListController(deps));
socialRouter.post(
  "/memes",
  upload.single("media"),
  createMemesController(deps)
);
socialRouter.delete("/memes/:memeId", deleteMemeController(deps));

export default socialRouter;
