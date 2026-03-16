import { Context } from "hono";
import { config } from "../config/env";

export const proxyToPrivate = async (
  c: Context,
  pathOverride?: string,
  baseUrl: string = config.PRIVATE_API_URL
) => {
  const method = c.req.method;
  const originalPath = pathOverride || c.req.path;
  const url = new URL(`${baseUrl}${originalPath}`);

  const headers = new Headers();

  // ✅ Forward Authorization & API Key
  const bearer = c.req.header("authorization");
  if (bearer) headers.set("authorization", bearer);

  headers.set("x-api-key", config.API_KEY);

  // ✅ Detect Content-Type
  const contentType = c.req.header("content-type");
  if (contentType) headers.set("content-type", contentType);

  // ✅ Prepare body safely (avoid stream issues)
  let body: BodyInit | undefined = undefined;

  if (method !== "GET" && method !== "HEAD") {
    if (contentType?.includes("application/json")) {
      const json = await c.req.json();
      body = JSON.stringify(json);
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const text = await c.req.text();
      body = text;
    } else if (contentType?.includes("multipart/form-data")) {
      // ⚠️ multipart/form-data avec fetch natif est complexe à proxifier
      // Il vaut mieux laisser le stream, mais il faudra le duplex: 'half'
      body = (await c.req.raw.body) ?? undefined;
    } else {
      // fallback: text or buffer
      body = await c.req.text();
    }
  }

  // ✅ Make the request
  const response = await fetch(url, {
    method,
    headers,
    body,
    ...(body instanceof ReadableStream ? { duplex: "half" as const } : {}), // only when needed
  });

  // ✅ Prepare response
  const contentTypeOut = response.headers.get("content-type") || "text/plain";
  const responseBody = await response.text();

  return new Response(responseBody, {
    status: response.status,
    headers: {
      "content-type": contentTypeOut,
    },
  });
};
