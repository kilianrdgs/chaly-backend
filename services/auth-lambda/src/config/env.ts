/**
 * Chargement typé et sécurisé des variables d'environnement
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // Environnement
  ENV: process.env.ENV || "DEV",

  // JWT Secrets (⛔ crash si absents)
  ACCESS_TOKEN_SECRET: requireEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: requireEnv("REFRESH_TOKEN_SECRET"),

  // JWT Expiration
  ACCESS_TOKEN_EXPIRES_IN: "15m",
  REFRESH_TOKEN_EXPIRES_IN: "90d",

  // Rate Limiting
  MAX_OTP_RETRIES: 2,
  OTP_EXPIRATION_MINUTES: 2,
  OTP_BLOCK_DURATION_MINUTES: 1, // Durée du blocage après dépassement

  // ⚠️ COMPTE TEST pour reviews App Store / Play Store
  // 📱 Numéro: +33600000000 | Code OTP: 1234
  // ⚠️ Activer UNIQUEMENT lors des reviews, puis désactiver immédiatement après !
  ENABLE_TEST_ACCOUNT: true, // ← Mettre à true pour activer le compte test
  TEST_PHONE_NUMBER: "+33600000000",
  TEST_OTP_CODE: "1234",
} as const;

export type Env = typeof env;
