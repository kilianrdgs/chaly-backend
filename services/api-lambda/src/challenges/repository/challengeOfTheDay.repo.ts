import { prisma } from "../../globals/bdd";

export async function challengeOfTheDayRepo(reponseLastChallengeId: number) {
  if (!reponseLastChallengeId) {
    return { error: "Id Challenge introuvable" };
  }

  const challenge = await prisma.challenges.findUnique({
    where: { Id: reponseLastChallengeId },
    select: { Post_StartAt: true, Post_EndAt: true, Vote_EndAt: true },
  });

  if (!challenge) {
    return { error: "Challenge introuvable" };
  }

  const participants = await prisma.cuites.findMany({
    where: { Id_Challenge: reponseLastChallengeId },
    select: { Id_User: true },
    distinct: ["Id_User"],
  });

  return {
    challengeId: reponseLastChallengeId,
    serverTime: new Date().toISOString(),
    postEndsAt: challenge.Post_EndAt,
    voteEndsAt: challenge.Vote_EndAt,
    participants: participants.length,
  };
}
