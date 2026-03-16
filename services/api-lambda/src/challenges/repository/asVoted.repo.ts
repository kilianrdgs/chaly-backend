import { prisma } from "../../globals/bdd";

export async function getVoteStateRepo(userId: number, challengeId: number) {
  const [userVote, totalVotes] = await Promise.all([
    prisma.votes.findFirst({
      where: {
        Id_User: userId,
        ChallengeId: challengeId,
      },
      select: { Id: true },
    }),
    prisma.votes.count({
      where: {
        ChallengeId: challengeId,
      },
    }),
  ]);

  return {
    hasVoted: !!userVote,
    participants: totalVotes,
  };
}
