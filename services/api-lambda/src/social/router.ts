import express from "express";

import PushService from "../communication/pushServices";
import S3Service from "../communication/s3Service";
import { CuitesRepository } from "../cuites/repository/cuitesRepository";
import type { ServiceDeps } from "../cuites/service/types";
import { createCommentController } from "./controller/createComment.controller";
import { deleteCommentController } from "./controller/deleteComment.controller";
import { getCommentsController } from "./controller/getComments.controller";
import { getLikesController } from "./controller/getLikes.controller";
import { likeCuiteController } from "./controller/likeCuite.controller";
import { unlikeCuiteController } from "./controller/unlikeCuite.controller";

const socialRouter = express.Router();

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
 *   name: Social
 *   description: API pour gérer les actions sociales
 */

// Routes concernant les commentaires
socialRouter.get("/cuites/:cuiteId/comments", getCommentsController(deps));
socialRouter.post("/cuites/:cuiteId/comment", createCommentController(deps));
socialRouter.delete(
	"/cuites/:commentId/comment",
	deleteCommentController(deps),
);

// Likes
socialRouter.get("/cuites/:cuiteId/likes", getLikesController(deps));
socialRouter.post("/cuites/:cuiteId/like", likeCuiteController(deps));
socialRouter.delete("/cuites/:cuiteId/like", unlikeCuiteController(deps));

export default socialRouter;
