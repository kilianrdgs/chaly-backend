import { prisma } from "../../globals/bdd";
import { getChallengeStartAndEnd } from "../utils/getChallengesStartAndEnd";

export async function createDailyChallengeRepo() {
  const { postStartUtc, postEndUtc, voteEndUtc } = getChallengeStartAndEnd();
  try {
    const newChallenge = await prisma.challenges.create({
      data: {
        Post_StartAt: postStartUtc,
        Post_EndAt: postEndUtc,
        Vote_EndAt: voteEndUtc,
      },
    });
    return newChallenge;
  } catch (error) {
    console.error("Erreur lors de la création du défi quotidien :", error);
    throw error;
  }
}
