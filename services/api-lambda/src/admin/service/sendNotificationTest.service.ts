import getAllNotifTokenRepo from "../../notifications/repository/getAllNotifToken.repo";
import { sendPushToMultiple } from "../../notifications/service/sendPushToMultiple.service";
import { sendPush } from "../../notifications/utils/sendNotifs";

export async function sendNotificationTestService(
  title: string,
  description: string,
  isMultiple: boolean = false,
  tokenPush?: string,
  postId?: number
) {
  const defaultTestToken =
    "20d7552116f70b3150fdb7b92c1ac5ca77c18d7b0cfced52926147053af03eff";

  const token = tokenPush || defaultTestToken;

  const responseTokens = await getAllNotifTokenRepo();

  const tokens = responseTokens
    .map((user) => user.TokenNotification)
    .filter((token): token is string => !!token);

  console.log(tokens);

  if (isMultiple) {
    // Envoi en mode multiple (notification groupée)
    const resultMultiple = await sendPushToMultiple(tokens, title, description);

    return {
      message: {
        success: true,
        resultMultiple,
        singleNotificationSent: false,
      },
    };
  } else {
    // Envoi en mode simple (push unique)
    await sendPush(token, title, description, postId);

    return {
      message: {
        success: true,
        singleNotificationSent: true,
      },
    };
  }
}
