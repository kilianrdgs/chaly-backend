type Phase = "POST" | "VOTE" | "RESULT";

export default function computePhase(
  now: Date,
  postEndsAt: Date,
  voteEndsAt: Date
): Phase {
  if (now < postEndsAt) return "POST";
  if (now < voteEndsAt) return "VOTE";
  return "RESULT";
}
