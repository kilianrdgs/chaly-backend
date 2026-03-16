import { sendPush } from "../../notifications/utils/sendNotifs";

export async function sendPushToMultiple(
  tokens: string[],
  title: string,
  body: string
) {
  const results = await Promise.allSettled(
    tokens.map((token) => sendPush(token, title, body))
  );

  const report = results.map((res, i) => {
    return {
      token: tokens[i],
      status: res.status,
      ...(res.status === "rejected" && {
        reason: res.reason instanceof Error
          ? res.reason.message
          : String(res.reason)
      }),
    };
  });

  return report;
}
