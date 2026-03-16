/**
 * Classes d'erreurs personnalisées pour l'application
 */

export enum ErrorCode {
  // Auth errors
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_MISSING = "TOKEN_MISSING",

  // OTP errors
  CODE_EXPIRED = "CODE_EXPIRED",
  CODE_INVALID = "CODE_INVALID",
  CODE_NOT_FOUND = "CODE_NOT_FOUND",

  // Rate limiting
  TOO_MANY_ATTEMPTS = "TOO_MANY_ATTEMPTS",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // User errors
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_CREATION_FAILED = "USER_CREATION_FAILED",

  // Phone errors
  PHONE_INVALID = "PHONE_INVALID",
  PHONE_FORMAT_INVALID = "PHONE_FORMAT_INVALID",

  // SMS errors
  SMS_SEND_FAILED = "SMS_SEND_FAILED",
  SMS_NETWORK_ERROR = "SMS_NETWORK_ERROR",
  SMS_TIMEOUT = "SMS_TIMEOUT",
  SMS_API_ERROR = "SMS_API_ERROR",

  // Database errors
  DATABASE_ERROR = "DATABASE_ERROR",

  // Generic errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

// Factory functions pour les erreurs courantes
export const createError = {
  tokenExpired: (message = "Token expiré") =>
    new AppError(401, ErrorCode.TOKEN_EXPIRED, message),

  tokenInvalid: (message = "Token invalide") =>
    new AppError(401, ErrorCode.TOKEN_INVALID, message),

  tokenMissing: (message = "Token manquant") =>
    new AppError(401, ErrorCode.TOKEN_MISSING, message),

  codeExpired: (message = "Le code de vérification a expiré") =>
    new AppError(401, ErrorCode.CODE_EXPIRED, message),

  codeInvalid: (message = "Le code de vérification est incorrect") =>
    new AppError(400, ErrorCode.CODE_INVALID, message),

  codeNotFound: (message = "Aucune demande de vérification trouvée") =>
    new AppError(404, ErrorCode.CODE_NOT_FOUND, message),

  tooManyAttempts: (message = "Trop de tentatives. Réessayez plus tard") =>
    new AppError(429, ErrorCode.TOO_MANY_ATTEMPTS, message),

  tooManyRequests: (message = "Trop de requêtes. Réessayez plus tard") =>
    new AppError(429, ErrorCode.TOO_MANY_REQUESTS, message),

  phoneInvalid: (message = "Numéro de téléphone invalide") =>
    new AppError(400, ErrorCode.PHONE_INVALID, message),

  phoneFormatInvalid: (message = "Format de numéro invalide (+XXXXXXXXXXX)") =>
    new AppError(400, ErrorCode.PHONE_FORMAT_INVALID, message),

  smsSendFailed: (message = "Erreur lors de l'envoi du SMS") =>
    new AppError(500, ErrorCode.SMS_SEND_FAILED, message),

  smsNetworkError: (message = "Impossible de contacter le service SMS") =>
    new AppError(503, ErrorCode.SMS_NETWORK_ERROR, message),

  smsTimeout: (message = "Le service SMS ne répond pas (timeout)") =>
    new AppError(504, ErrorCode.SMS_TIMEOUT, message),

  smsApiError: (message = "Le service SMS a retourné une erreur", details?: unknown) =>
    new AppError(502, ErrorCode.SMS_API_ERROR, message, details),

  databaseError: (message = "Erreur de base de données", details?: unknown) =>
    new AppError(500, ErrorCode.DATABASE_ERROR, message, details),

  validationError: (message = "Erreur de validation", details?: unknown) =>
    new AppError(400, ErrorCode.VALIDATION_ERROR, message, details),

  internalServerError: (message = "Erreur serveur", details?: unknown) =>
    new AppError(500, ErrorCode.INTERNAL_SERVER_ERROR, message, details),

  badRequest: (message = "Requête invalide", details?: unknown) =>
    new AppError(400, ErrorCode.BAD_REQUEST, message, details),
};
