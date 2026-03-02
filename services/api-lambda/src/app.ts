import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./configs/swaggerOptions";
import { errorHandler } from "./globals/errorHandler";
import { apiLimiter } from "./middlewares/rateLimiter";
import globalRouter from "./router";

const app = express();

const ENV = process.env.ENV ?? "DEV";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// === Configuration pour AWS Lambda / API Gateway ===
// Faire confiance aux headers proxy (X-Forwarded-For, etc.)
app.set("trust proxy", 1);

// === Middleware global ===
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// === Routes API principales ===
app.use("/api", apiLimiter, globalRouter);

// === Swagger (uniquement en DEV/STAGING) ===
if (ENV === "DEV" || ENV === "STAGING") {
	const specs = swaggerJsdoc(swaggerOptions);
	app.use("/doc", swaggerUi.serve, swaggerUi.setup(specs));
}

// === Gestion globale des erreurs ===
app.use(errorHandler);

// === Démarrage local uniquement ===
if (process.env.IS_OFFLINE || ENV === "DEV" || ENV === "STAGING") {
	app.listen(PORT, () => {
		console.info(`🚀 Serveur local lancé sur http://localhost:${PORT}/doc`);
	});
}

// === Export handler pour AWS Lambda ===
export const handler = serverless(app);
