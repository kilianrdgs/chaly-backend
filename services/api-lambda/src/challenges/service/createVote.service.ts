import computePhase from "../../app/utils/computePhase";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { challengeOfTheDayRepo } from "../repository/challengeOfTheDay.repo";
import { createVoteRepo } from "../repository/createVote.repo";
import findCuiteRepo from "../repository/findCuite.repo";
import { getCurrentChallengeRepo } from "../repository/getCurrentChallenge.repo";
import { getPreviousChallengeRepo } from "../repository/getPreviousChallenge.repo";
import verifyVoteRepo from "../repository/verifyVote.repo";

export async function createVoteService(userId: number, cuiteId: number) {
  const reponsePriviousChallengeId = await getPreviousChallengeRepo();
  const appState = await challengeOfTheDayRepo(reponsePriviousChallengeId);

  if (!appState?.postEndsAt || !appState.voteEndsAt) {
    throw new CustomError(
      "Challenge mal configuré",
      StatusCodeEnum.InternalServerError
    );
  }

  const cuite = await findCuiteRepo(cuiteId, reponsePriviousChallengeId);

  if (!cuite || cuite.Id_Challenge !== reponsePriviousChallengeId) {
    throw new CustomError(
      "Photo invalide pour ce challenge",
      StatusCodeEnum.BadRequest
    );
  }

  const phase = computePhase(
    new Date(appState.serverTime),
    new Date(appState.postEndsAt),
    new Date(appState.voteEndsAt)
  );

  if (phase !== "VOTE") {
    throw new CustomError("Les votes sont fermés", StatusCodeEnum.Forbidden);
  }

  const alreadyVoted = await verifyVoteRepo(userId, reponsePriviousChallengeId);

  if (alreadyVoted) {
    throw new CustomError(
      "Tu as déjà voté pour ce challenge",
      StatusCodeEnum.Forbidden
    );
  }

  return await createVoteRepo(userId, cuiteId, reponsePriviousChallengeId);
}
