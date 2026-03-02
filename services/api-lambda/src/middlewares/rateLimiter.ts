import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
	message: { message: "Trop de requêtes, réessayez plus tard." },
	standardHeaders: true,
	legacyHeaders: false,
});

export const otpLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: { message: "Trop de requêtes, réessayez plus tard." },
	standardHeaders: true,
	legacyHeaders: false,
});
