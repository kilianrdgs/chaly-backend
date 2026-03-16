import { getVoteStatsRepo } from "../repository/getVoteStats.repo";

export async function getVoteStatsService(challengeId: number) {
  return await getVoteStatsRepo(challengeId);
}
