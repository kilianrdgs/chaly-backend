import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestCodeHandler } from "./handlers/requestCode.handler";
import { analyseImageHandler } from "./handlers/analyseImage.handler";
import { sendNotifHandler } from "./handlers/sendNotif.handler";

const app = new Hono();

// Logger middleware
app.use("*", logger());

// CORS middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);

// Health check route
app.get("/", (c) =>
  c.json({
    success: true,
    message: "Public Lambda API",
    version: "1.0.0",
  })
);

app.get("/send-notification", sendNotifHandler);

// Route /auth/request-code : appelle auth-lambda, intercepte la réponse, envoie le SMS
app.post("/auth/request-code", requestCodeHandler);

// Route /pictures/analyse : analyse une image avec vision stage + reasoning stage
app.post("/pictures/analyse", analyseImageHandler);

// 404 handler
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
