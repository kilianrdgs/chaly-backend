import S3Service from "../../communication/s3Service";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { HttpError, StatusCode } from "../../globals/http";
import { getIdByPseudoRepo } from "../../users/repository/getIdByPseudo";
import { getOrCreateUserRepo } from "../../users/repository/getOrCreateUser.repo";

import type UserDto from "../../users/service/models/userDto";
import { verifyCodeRepo } from "../repository/verifyCode.repo";
import { generateTokensService } from "./generateTokens.service";

const s3Service = new S3Service();

export async function verifyCodeService(code: string, number: string) {
	// normalise pour éviter les surprises d’espaces/format
	const trimmedCode = code?.trim();
	const trimmedNumber = number?.trim();

	// check dans la table PhoneVerifications
	const verifCode = await verifyCodeRepo(trimmedCode, trimmedNumber);

	if (verifCode instanceof CustomError) {
		switch (verifCode.StatusCode) {
			case StatusCodeEnum.NoContent:
				throw new HttpError(
					StatusCode.NotFound,
					"VERIFICATION_NOT_FOUND",
					"Aucune demande de vérification trouvée pour ce numéro",
				);

			case StatusCodeEnum.TooManyRequests:
				throw new HttpError(
					StatusCode.TooManyRequests,
					"TOO_MANY_ATTEMPTS",
					"Trop de tentatives. Réessayez plus tard",
				);

			case StatusCodeEnum.RequestTimeOut:
				throw new HttpError(
					StatusCode.Unauthorized,
					"CODE_EXPIRED",
					"Le code de vérification a expiré",
				);

			case StatusCodeEnum.BadRequest:
				throw new HttpError(
					StatusCode.BadRequest,
					"INVALID_CODE",
					"Le code de vérification est incorrect",
				);

			case StatusCodeEnum.InternalServerError:
				throw new HttpError(
					StatusCode.InternalServerError,
					"DATABASE_ERROR",
					"Erreur de base de données lors de la vérification",
				);

			default:
				throw new HttpError(
					StatusCode.InternalServerError,
					"VERIFICATION_ERROR",
					"Erreur lors de la vérification du code",
				);
		}
	}

	if (verifCode === true) {
		const userResult = await getOrCreateUserRepo(trimmedNumber);

		if (userResult instanceof CustomError) {
			throw new HttpError(
				StatusCode.InternalServerError,
				"USER_ERROR",
				"Erreur lors de la récupération ou création de l'utilisateur",
			);
		}
		const { user, isNewUser } = userResult;

		await enrichWithSignedPhotoUrl(user);

		let hasPseudo = false;
		if (!isNewUser && user.Pseudo) {
			const pseudoResult = await getIdByPseudoRepo(user.Pseudo);
			hasPseudo = !(pseudoResult instanceof CustomError);
		}

		const tokens = await generateTokensService(userResult.user.Id);

		return {
			...tokens,
			user,
			isNewUser,
			requiresPseudo: isNewUser || !hasPseudo,
		};
	}
}

// ----------------------------------------------------------------------------------------------
// Remplace PhotoUrl par une URL signée si besoin

async function enrichWithSignedPhotoUrl(user: UserDto) {
	const bucket = process.env.AWS_S3_BUCKET ?? "bucket";
	if (!user?.PhotoUrl) return;

	// Accepte les deux formes: URL complète S3 ou clé brute
	const key = user.PhotoUrl.includes("amazonaws.com/")
		? user.PhotoUrl.split("amazonaws.com/")[1]
		: user.PhotoUrl;

	user.PhotoUrl = await s3Service.getSignedImageUrl(bucket, key);
}

// ----------------------------------------------------------------------------------------------
// Pour les tests, insérer dans PhoneVerifications

/*

INSERT INTO "PhoneVerifications" ("Phone", "Code", "ExpiresAt") 
VALUES ('+33600000000', '1234', NOW() + INTERVAL '2 hours 10 minutes');

*/
