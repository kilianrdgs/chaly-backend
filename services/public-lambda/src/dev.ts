import "dotenv/config";
import app from "./app";
import { serve } from "@hono/node-server";

serve({
  fetch: app.fetch,
  port: 3002,
});

console.log("✅ Public Lambda running locally at http://localhost:3002");
console.log(`📝 ENV mode: ${process.env.ENV}`);
console.log(`🔑 Bedrock Access Key ID: ${process.env.BEDROCK_ACCESS_KEY_ID?.slice(0, 10)}...`);
