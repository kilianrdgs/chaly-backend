import { prisma } from "../../globals/bdd";

export async function getVoteStatsRepo(challengeId: number) {
  try {
    const votes = await prisma.votes.findMany({
      where: { ChallengeId: challengeId },
      select: {
        Id_Cuite: true,
        User: {
          select: {
            Id: true,
            Pseudo: true,
          },
        },
        Cuite: {
          select: {
            Id: true,
            User: {
              select: {
                Id: true,
                Pseudo: true,
              },
            },
          },
        },
      },
    });

    const totalVotes = votes.length;

    // 3️⃣ Agrégation côté JS (propre, lisible)
    const votesMap = new Map<number, any>();

    for (const vote of votes) {
      if (!votesMap.has(vote.Id_Cuite)) {
        votesMap.set(vote.Id_Cuite, {
          cuiteId: vote.Id_Cuite,
          cuiteOwner: vote.Cuite.User,
          votesCount: 0,
          voters: [],
        });
      }

      const entry = votesMap.get(vote.Id_Cuite);
      entry.votesCount += 1;
      entry.voters.push(vote.User);
    }

    return {
      challengeId,
      totalVotes,
      votes: Array.from(votesMap.values()),
    };
  } catch (error) {
    console.error("Erreur lors de la création du défi quotidien :", error);
    throw error;
  }
}
