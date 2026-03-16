import { getInfoUserByCuiteIdRepo } from "../../cuites/repository/getInfoUserByCuiteId.repo";
// cuites/service/likeCuite.service.ts
import CustomError from "../../globals/customError";
import { sendPush } from "../../notifications/utils/sendNotifs";
import { getUsernameByIdRepo } from "../../users/repository/getUsernameById.repo";
import { getSocialCountRepo } from "../repository/getSocialCount.repo";
import { likeCuiteRepo } from "../repository/likeCuite.repo";

export async function likeCuiteService(cuiteId: number, userId: number) {
  // Like the cuite
  const resultLike = await likeCuiteRepo(cuiteId, userId);
  if (resultLike instanceof CustomError) return resultLike;

  // Get info and social count in parallel (independent operations)
  const [responseGetSocialCountRepo, info] = await Promise.all([
    getSocialCountRepo(cuiteId, userId),
    getInfoUserByCuiteIdRepo(cuiteId),
  ]);

  if (responseGetSocialCountRepo instanceof CustomError)
    return responseGetSocialCountRepo;
  if (info instanceof CustomError) return info;

  // Send notification only if user is not liking their own post
  if (userId !== info.Id_User && info.TokenNotification) {
    try {
      const username = await getUsernameByIdRepo(userId);
      if (username instanceof CustomError) {
        console.error(
          "Failed to get username for notification:",
          username.Message
        );
      } else if (username) {
        await sendPush(
          info.TokenNotification,
          username,
          "a aimé ton post",
          cuiteId
        );
      }
    } catch (error) {
      console.error("Failed to send push notification:", error);
      // Don't fail the entire operation if notification fails
    }
  }

  return responseGetSocialCountRepo;
}
