import { randomInt } from "node:crypto";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { prisma } from "../../globals/bdd";

const MAX_RETRIES = 2;
const API_TOP_MESSAGE_KEY =
	process.env.API_TOP_MESSAGE_KEY || "default_secret_key";
const ENV = process.env.ENV;

export async function requestCodeRepo(number: string) {
	// Validate phone number format (must be E.164 format: +XXXXXXXXXXX)
	if (!number || !number.startsWith("+")) {
		return {
			success: false,
			message: "Le numéro doit être au format international (+XXXXXXXXXXX)",
		};
	}

	try {
		const phoneNumber = parsePhoneNumberWithError(number);
		if (!phoneNumber.isValid()) {
			return {
				success: false,
				message: "Numéro de téléphone invalide",
			};
		}
	} catch (error) {
		return {
			success: false,
			message: "Format de numéro de téléphone invalide",
		};
	}
	let otpCode = randomInt(1000, 9999).toString();

	// Compte test uniquement en développement
	if (ENV === "DEV" && number === "+33600000000") {
		otpCode = "1234";
	}

	const existing = await prisma.phoneVerifications.findUnique({
		where: { Phone: number },
	});

	if (existing) {
		// Bloquer si trop de demandes de codes
		if (existing.Retries >= MAX_RETRIES) {
			return {
				success: false,
				message: "Trop de tentatives : numéro bloqué.",
			};
		}

		// Mettre à jour avec un nouveau code et incrémenter les tentatives
		await prisma.phoneVerifications.update({
			where: { Phone: number },
			data: {
				Code: otpCode,
				Retries: existing.Retries + 1,
				CreatedAt: new Date(),
				ExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
			},
		});
	} else {
		// Créer une nouvelle entrée de vérification
		await prisma.phoneVerifications.create({
			data: {
				Phone: number,
				Code: otpCode,
				Retries: 0,
				CreatedAt: new Date(),
				ExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
			},
		});
	}

	// Court-circuit pour le compte test en DEV
	if (ENV === "DEV" && number === "+33600000000") {
		return {
			success: true,
			message: "Code envoyé avec succès. (compte test)",
		};
	}

	try {
		const response = await fetch("https://api.topmessage.fr/v1/messages", {
			method: "POST",
			headers: {
				"X-TopMessage-Key": API_TOP_MESSAGE_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				data: {
					from: "Chaly",
					to: [number],
					text: `🎯 Ton code de connexion : ${otpCode}`,
					shorten_URLs: false,
				},
			}),
		});

		// Vérifier le statut HTTP de la réponse
		if (!response.ok) {
			const errorText = await response.text().catch(() => "Aucune réponse");
			console.error(`Erreur API TopMessage [${response.status}]:`, errorText);
			return {
				success: false,
				message: "Erreur lors de l'envoi du SMS",
			};
		}

		// Optionnel : vérifier le JSON de réponse si l'API retourne des détails
		const responseData = await response.json().catch(() => ({}));
		console.info("SMS envoyé avec succès:", responseData);
	} catch (error) {
		console.error("Erreur réseau lors de l'envoi du SMS:", error);
		return {
			success: false,
			message: "Erreur lors de l'envoi du SMS",
		};
	}

	// SMS envoyé avec succès, maintenant on peut mettre à jour la base de données
	if (existing) {
		await prisma.phoneVerifications.update({
			where: { Phone: number },
			data: {
				Code: otpCode,
				Retries: existing.Retries + 1,
				CreatedAt: new Date(),
				ExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
			},
		});
	} else {
		await prisma.phoneVerifications.create({
			data: {
				Phone: number,
				Code: otpCode,
				Retries: 0,
				CreatedAt: new Date(),
				ExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
			},
		});
	}

	return {
		success: true,
		message: "Code envoyé avec succès.",
	};
}
