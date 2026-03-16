import type { RequestHandler } from "express";
import CustomError from "../../globals/customError";
import { createVoteService } from "../service/createVote.service";

/**
 * @swagger
 * /api/challenges/vote:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Challenges]
 *     summary: Voter pour une photo du défi quotidien
 *     description: >
 *       Permet à un utilisateur authentifié de voter pour une photo
 *       (cuite) dans le défi quotidien en cours.
 *       Un seul vote est autorisé par utilisateur et par challenge.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cuiteId
 *             properties:
 *               cuiteId:
 *                 type: integer
 *                 description: Identifiant de la photo (cuite) pour laquelle l’utilisateur vote
 *                 example: 123
 *     responses:
 *       200:
 *         description: Vote enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vote enregistré
 *       400:
 *         description: Requête invalide (cuiteId manquant ou invalide)
 *       403:
 *         description: Vote non autorisé (vote fermé ou déjà voté)
 *       404:
 *         description: Challenge ou photo introuvable
 *       500:
 *         description: Erreur serveur
 */

export function createVoteController(): RequestHandler {
  return async (req, res) => {
    console.log("createVoteController invoked");
    const userId = res.locals.userId;
    const { cuiteId } = req.body;

    if (!cuiteId || typeof cuiteId !== "number") {
      return res.status(400).json({ message: "cuiteId invalide" });
    }

    try {
      console.log(
        "createVoteController called with userId:",
        userId,
        "cuiteId:",
        cuiteId
      );
      await createVoteService(userId, cuiteId);

      return res.status(200).json({
        message: "Vote enregistré",
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return res.status(err.StatusCode ?? 500).json({ message: err.Message });
      }

      console.error("createVoteController error:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
}
