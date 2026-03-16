/**
 * Schémas de validation Zod pour le module Auth
 */

import { z } from "zod";

/**
 * Validation du numéro de téléphone (format E.164: +XXXXXXXXXXX)
 */
const phoneSchema = z
  .string()
  .min(1, "Le numéro de téléphone est requis")
  .regex(/^\+\d{10,15}$/, "Format invalide (+XXXXXXXXXXX)");

/**
 * Validation du code OTP (4 chiffres)
 */
const otpCodeSchema = z
  .string()
  .length(4, "Le code doit contenir 4 chiffres")
  .regex(/^\d{4}$/, "Le code doit être composé de chiffres uniquement");

/**
 * Schéma pour la requête request-code
 */
export const requestCodeSchema = z.object({
  phone: phoneSchema,
});

export type RequestCodeInput = z.infer<typeof requestCodeSchema>;

/**
 * Schéma pour la requête verify-code
 */
export const verifyCodeSchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
});

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;

/**
 * Schéma pour la requête refresh-token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Le refresh token est requis"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Schéma pour la requête logout (optionnel selon votre logique)
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Le refresh token est requis"),
});

export type LogoutInput = z.infer<typeof logoutSchema>;
