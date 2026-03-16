/**
 * Routes de test (DB, Lambda, etc.)
 * À utiliser uniquement en développement
 */

import { Hono } from "hono";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { prisma } from "../../lib/prisma";
import { successResponse, handleError } from "../../utils/response";
import { env } from "../../config/env";

export const testRouter = new Hono();

/**
 * GET /test/health
 * Health check simple
 */
testRouter.get("/health", (c) => {
  return successResponse(c, {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.ENV,
  });
});

/**
 * GET /test/db
 * Test de connexion à la base de données
 */
testRouter.get("/db", async (c) => {
  try {
    const users = await prisma.users.findMany({ take: 1 });
    return successResponse(c, {
      ok: true,
      message: "Connexion DB réussie",
      users,
    });
  } catch (error) {
    return handleError(c, error);
  }
});

/**
 * GET /test/public-lambda
 * Test d'invocation du public-lambda
 */
testRouter.get("/public-lambda", async (c) => {
  const client = new LambdaClient({ region: "eu-west-3" });

  const payloadToSend = {
    test: true,
    source: "auth-lambda",
  };

  const command = new InvokeCommand({
    FunctionName: "public-prod-lambda",
    Payload: Buffer.from(JSON.stringify(payloadToSend)),
  });

  try {
    const response = await client.send(command);

    const responseString = Buffer.from(response.Payload!).toString("utf-8");
    const responseJson = JSON.parse(responseString);

    return successResponse(c, {
      ok: true,
      response: responseJson,
      statusCode: response.StatusCode,
      logs: response.LogResult
        ? Buffer.from(response.LogResult, "base64").toString("utf-8")
        : null,
    });
  } catch (error) {
    return handleError(c, error);
  }
});
