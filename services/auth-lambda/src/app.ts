/**
 * Application - Auth Lambda
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { authRouter } from "./modules/auth.routes";
import { testRouter } from "./modules/test/test.routes";
import { env } from "./config/env";

// Type pour les variables du context
type Variables = {
  userId: number;
};

const app = new Hono<{ Variables: Variables }>();

// Logger (affiche les requêtes dans la console)
app.use("*", logger());

// CORS - Configuration sécurisée pour mobile
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (env.ENV === "DEV") {
        return origin || "*";
      }

      if (!origin) {
        return "*"; // Apps mobiles natives
      }

      return ""; // Rejette la requête
    },
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);

// ===================================
// Routes
// ===================================

// Health check
app.get("/", (c) =>
  c.json({
    success: true,
    message: "Auth Lambda API",
    version: "2.0.0",
    environment: env.ENV,
  })
);

// Module Auth
app.route("/auth", authRouter);

// Module Test (uniquement en DEV)

app.route("/test", testRouter);

// ===================================
// Gestion d'erreurs globale
// ===================================

app.onError(errorHandler);

// Route 404
app.notFound((c) =>
  c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Route non trouvée",
      },
    },
    404
  )
);

export default app;
