import multer from "multer";

/**
 * Middleware Multer configuré pour l'upload d'images.
 * - Stockage en mémoire
 * - Taille max : 50 Mo
 * - Formats autorisés : jpeg, png, gif, webp, bmp, tiff
 */

export const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 50 * 1024 * 1024 },
	fileFilter: (_req, f, cb) =>
		cb(
			null,
			[
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
				"image/bmp",
				"image/tiff",
			].includes(f.mimetype),
		),
});
