import app from "./app";
import { serve } from "@hono/node-server";

serve({
  fetch: app.fetch,
  port: 3001,
});

console.log("✅ Auth Lambda running locally at http://localhost:3001");
