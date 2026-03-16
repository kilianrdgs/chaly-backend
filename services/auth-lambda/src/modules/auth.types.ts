/**
 * Types TypeScript pour le module Auth
 */

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  Id: number;
  PhoneNumber: string;
  Pseudo?: string | null;
  PhotoUrl?: string | null;
  XpTotal?: number;
  IsVerified?: boolean;
  IsCertified?: boolean;
  Description?: string | null;
  // Ajoutez d'autres champs selon votre schéma Prisma
}

export interface RequestCodeResponse {
  success: boolean;
  message: string;
  phoneNumber?: string;
  codeOtp?: string;
}

export interface VerifyCodeResponse extends TokenPair {
  isNewUser: boolean;
  requiresPseudo: boolean;
}

export interface RefreshTokenResponse extends TokenPair {}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Données stockées pour la vérification de code
 */
export interface PhoneVerification {
  Phone: string;
  Code: string;
  Retries: number;
  CreatedAt: Date;
  ExpiresAt: Date;
}
