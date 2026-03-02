import { Hono } from "hono";
import prisma from "./lib/prisma";

const app = new Hono();

app.get("/", (c) => c.text("Hello from Auth Lambda!"));

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/db-test", async (c) => {
  try {
    const users = await prisma.users.findMany({ take: 1 });
    return c.json({
      ok: true,
      users,
    });
  } catch (err) {
    console.error(err);
    return c.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      500
    );
  }
});

export default app;
