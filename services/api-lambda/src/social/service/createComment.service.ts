import { getInfoUserByCuiteIdRepo } from "../../cuites/repository/getInfoUserByCuiteId.repo";
// cuites/service/createComment.service.ts
import CustomError from "../../globals/customError";
import { sendPush } from "../../notifications/utils/sendNotifs";
import { getUsernameByIdRepo } from "../../users/repository/getUsernameById.repo";
import { getNotificationTokenRepo } from "../../users/repository/getNotificationToken.repo";
import { createCommentRepo } from "../repository/createComment.api";
import { getSocialCountRepo } from "../repository/getSocialCount.repo";

export async function createCommentService(
  cuiteId: number,
  userId: number,
  comment: string,
  mentions?: number[],
  imageUrl?: string,
  memeId?: number
) {
  const resultComment = await createCommentRepo(cuiteId, userId, comment, mentions, imageUrl, memeId);
  if (resultComment instanceof CustomError) return resultComment;

  // Get info and social count in parallel (independent operations)
  const [responseGetSocialCountRepo, info] = await Promise.all([
    getSocialCountRepo(cuiteId, userId),
    getInfoUserByCuiteIdRepo(cuiteId),
  ]);

  if (responseGetSocialCountRepo instanceof CustomError)
    return responseGetSocialCountRepo;
  if (info instanceof CustomError) return info;

  // Send notification only if user is not commenting their own post
  if (userId !== info.Id_User && info.TokenNotification) {
    try {
      const username = await getUsernameByIdRepo(userId);
      if (username instanceof CustomError) {
        console.error(
          "Failed to get username for notification:",
          username.Message
        );
      } else if (username) {
        await sendPush(info.TokenNotification, username, comment, cuiteId);
      }
    } catch (error) {
      console.error("Failed to send push notification:", error);
      // Don't fail the entire operation if notification fails
    }
  }

  // Send notifications to mentioned users
  if (mentions && mentions.length > 0) {
    try {
      const username = await getUsernameByIdRepo(userId);
      if (username instanceof CustomError) {
        console.error(
          "Failed to get username for mention notifications:",
          username.Message
        );
      } else if (username) {
        // Send notification to each mentioned user in parallel
        const mentionNotifications = mentions.map(async (mentionedUserId) => {
          try {
            // Don't notify if user mentioned themselves
            if (mentionedUserId === userId) {
              return;
            }

            // Get notification token for mentioned user
            const mentionedUserToken = await getNotificationTokenRepo(mentionedUserId);
            if (mentionedUserToken instanceof CustomError || !mentionedUserToken) {
              console.error(
                `No notification token for mentioned user ID ${mentionedUserId}`
              );
              return;
            }

            // Send notification
            await sendPush(
              mentionedUserToken,
              username,
              `${username} vous a mentionné : ${comment}`,
              cuiteId
            );
          } catch (error) {
            console.error(
              `Failed to send mention notification to user ID ${mentionedUserId}:`,
              error
            );
          }
        });

        await Promise.allSettled(mentionNotifications);
      }
    } catch (error) {
      console.error("Failed to send mention notifications:", error);
      // Don't fail the entire operation if notifications fail
    }
  }

  return responseGetSocialCountRepo;
}
