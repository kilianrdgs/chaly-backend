/**
 * @swagger
 * components:
 *   schemas:
 *     CuiteComment:
 *       type: object
 *       description: Représentation d'un commentaire associé à une cuite
 *       required:
 *         - id
 *         - comment
 *         - createdAt
 *         - userPseudo
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique du commentaire
 *         comment:
 *           type: string
 *           description: Contenu du commentaire
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du commentaire
 *         userPseudo:
 *           type: string
 *           description: Pseudonyme de l'auteur du commentaire
 *         UserPicture:
 *           type: string
 *           nullable: true
 *           description: URL de la photo de profil de l'auteur, si disponible
 *         UserId:
 *           type: integer
 *           description: Identifiant unique de l'auteur du commentaire
 *         ImageUrl:
 *           type: string
 *           nullable: true
 *           description: URL de l'image du commentaire, si disponible
 *         mentions:
 *           type: array
 *           items:
 *             type: integer
 *           nullable: true
 *           description: Liste des IDs des utilisateurs mentionnés dans le commentaire
 *         Id_Meme:
 *           type: integer
 *           nullable: true
 *           description: ID du meme utilisé dans le commentaire, si disponible
 */

export class CuiteComment {
	constructor(
		public Id: number,
		public Comment: string,
		public CreatedAt: Date,
		public UserPseudo: string,
		public UserPicture?: string,
		public UserId?: number,
		public Mentions?: number[] | null,
		public ImageUrl?: string,
		public Id_Meme?: number | null,
	) {}
}
