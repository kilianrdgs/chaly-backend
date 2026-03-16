import { getVoteStateRepo } from "../../challenges/repository/asVoted.repo";
import { challengeOfTheDayRepo } from "../../challenges/repository/challengeOfTheDay.repo";
import { getCurrentChallengeRepo } from "../../challenges/repository/getCurrentChallenge.repo";
import { getPreviousChallengeRepo } from "../../challenges/repository/getPreviousChallenge.repo";
import { getChallengeStartAndEnd } from "../../challenges/utils/getChallengesStartAndEnd";
import { AppState } from "../models/appState.model";

export default async function getAppStateService(
  userId: number
): Promise<AppState> {
  const now = new Date();

  const currentChallengeId = await getCurrentChallengeRepo();
  const previousChallengeId = await getPreviousChallengeRepo();

  const responseRepo = await challengeOfTheDayRepo(currentChallengeId);
  const voteChallenge = await challengeOfTheDayRepo(previousChallengeId);

  const { hasVoted, participants } = await getVoteStateRepo(
    userId,
    previousChallengeId
  );

  if (!responseRepo.postEndsAt || !responseRepo.voteEndsAt) {
    throw new Error("Challenge mal configuré (dates manquantes)");
  }

  if (!voteChallenge.postEndsAt || !voteChallenge.voteEndsAt) {
    throw new Error("Challenge mal configuré (dates manquantes)");
  }

  console.log("ici : ", responseRepo);

  const canVote =
    now >= voteChallenge.postEndsAt &&
    now < voteChallenge.voteEndsAt &&
    !hasVoted;

  // TEST RETOUR MOCK

  //     return {
  //   serverTime: "2025-12-27T19:30:00.000Z", // 👈 FORCÉ
  //   currentChallenge: {
  //     id: currentChallengeId,
  //     endsAt: "2025-12-27T19:00:00.000Z", // 👈 fin du post
  //     participants: responseRepo.participants,
  //   },
  //   vote: {
  //     challengeId: previousChallengeId,
  //     endsAt: "2025-12-27T20:00:00.000Z", // 👈 fin du vote
  //     canVote: true, // 👈 FORCÉ
  //     hasVoted: false,
  //     participants,
  //   },
  // };

  return {
    serverTime: now.toISOString(),
    currentChallenge: {
      id: currentChallengeId,
      endsAt: responseRepo.postEndsAt.toISOString(),
      participants: responseRepo.participants,
    },
    vote: {
      challengeId: previousChallengeId,
      endsAt: responseRepo.voteEndsAt.toISOString(),
      canVote,
      hasVoted,
      participants,
    },
  };
}
