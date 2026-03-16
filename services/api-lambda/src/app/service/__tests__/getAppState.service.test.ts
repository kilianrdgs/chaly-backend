import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../../challenges/repository/getCurrentChallenge.repo", () => ({
  getCurrentChallengeRepo: vi.fn(),
}));

vi.mock("../../../challenges/repository/getPreviousChallenge.repo", () => ({
  getPreviousChallengeRepo: vi.fn(),
}));

vi.mock("../../../challenges/repository/challengeOfTheDay.repo", () => ({
  challengeOfTheDayRepo: vi.fn(),
}));

vi.mock("../../../challenges/repository/asVoted.repo", () => ({
  getVoteStateRepo: vi.fn(),
}));

import getAppStateService from "../getAppState.service";
import { getCurrentChallengeRepo } from "../../../challenges/repository/getCurrentChallenge.repo";
import { getPreviousChallengeRepo } from "../../../challenges/repository/getPreviousChallenge.repo";
import { challengeOfTheDayRepo } from "../../../challenges/repository/challengeOfTheDay.repo";
import { getVoteStateRepo } from "../../../challenges/repository/asVoted.repo";

describe("getAppStateService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it("Si now < postEndsAt -> canVote false", async () => {
    const now = new Date("2025-12-27T10:00:00.000Z");
    vi.setSystemTime(now);

    const currentChallengeId = 100;
    const previousChallengeId = 99;

    const postEndsAt = new Date("2025-12-27T20:00:00.000Z");
    const voteEndsAt = new Date("2025-12-27T21:00:00.000Z");

    vi.mocked(getCurrentChallengeRepo).mockResolvedValue(currentChallengeId);
    vi.mocked(getPreviousChallengeRepo).mockResolvedValue(previousChallengeId);

    vi.mocked(challengeOfTheDayRepo).mockResolvedValue({
      postEndsAt,
      voteEndsAt,
      participants: 15,
    } as any);

    vi.mocked(getVoteStateRepo).mockResolvedValue({
      hasVoted: false,
      participants: 20,
    });

    const result = await getAppStateService(10);

    expect(result.currentChallenge.id).toBe(currentChallengeId);
    expect(result.vote.challengeId).toBe(previousChallengeId);

    expect(result.vote.hasVoted).toBe(false);
    expect(result.vote.canVote).toBe(false);
  });

  it("Si postEndsAt <= now < voteEndsAt -> canVote true", async () => {
    const now = new Date("2025-12-27T20:30:00.000Z");
    vi.setSystemTime(now);

    const currentChallengeId = 100;
    const previousChallengeId = 99;

    const postEndsAt = new Date("2025-12-27T20:00:00.000Z");
    const voteEndsAt = new Date("2025-12-27T21:00:00.000Z");

    (getCurrentChallengeRepo as any).mockResolvedValue(currentChallengeId);
    (getPreviousChallengeRepo as any).mockResolvedValue(previousChallengeId);

    (challengeOfTheDayRepo as any).mockResolvedValue({
      postEndsAt,
      voteEndsAt,
      participants: 15,
    });

    (getVoteStateRepo as any).mockResolvedValue({
      hasVoted: false,
      participants: 20,
    });

    const result = await getAppStateService(10);

    expect(result.vote.hasVoted).toBe(false);
    expect(result.vote.canVote).toBe(true);
  });

  it("Si période de vote active ET user a déjà voté -> canVote false", async () => {
    const now = new Date("2025-12-27T20:30:00.000Z");
    vi.setSystemTime(now);

    const currentChallengeId = 100;
    const previousChallengeId = 99;

    const postEndsAt = new Date("2025-12-27T20:00:00.000Z");
    const voteEndsAt = new Date("2025-12-27T21:00:00.000Z");

    (getCurrentChallengeRepo as any).mockResolvedValue(currentChallengeId);
    (getPreviousChallengeRepo as any).mockResolvedValue(previousChallengeId);

    (challengeOfTheDayRepo as any).mockResolvedValue({
      postEndsAt,
      voteEndsAt,
      participants: 15,
    });

    (getVoteStateRepo as any).mockResolvedValue({
      hasVoted: true,
      participants: 20,
    });

    const result = await getAppStateService(10);

    expect(result.vote.hasVoted).toBe(true);
    expect(result.vote.canVote).toBe(false);
  });

  it("Si now >= voteEndsAt -> canVote false", async () => {
    const now = new Date("2025-12-27T21:30:00.000Z");
    vi.setSystemTime(now);

    const currentChallengeId = 100;
    const previousChallengeId = 99;

    const postEndsAt = new Date("2025-12-27T20:00:00.000Z");
    const voteEndsAt = new Date("2025-12-27T21:00:00.000Z");

    (getCurrentChallengeRepo as any).mockResolvedValue(currentChallengeId);
    (getPreviousChallengeRepo as any).mockResolvedValue(previousChallengeId);

    (challengeOfTheDayRepo as any).mockResolvedValue({
      postEndsAt,
      voteEndsAt,
      participants: 15,
    });

    (getVoteStateRepo as any).mockResolvedValue({
      hasVoted: false,
      participants: 20,
    });

    const result = await getAppStateService(10);

    expect(result.vote.canVote).toBe(false);
  });

  it("Si postEndsAt manquant -> throw", async () => {
    const now = new Date("2025-12-27T10:00:00.000Z");
    vi.setSystemTime(now);

    (getCurrentChallengeRepo as any).mockResolvedValue(100);
    (getPreviousChallengeRepo as any).mockResolvedValue(99);

    (challengeOfTheDayRepo as any).mockResolvedValue({
      postEndsAt: null,
      voteEndsAt: new Date("2025-12-27T21:00:00.000Z"),
      participants: 15,
    });

    (getVoteStateRepo as any).mockResolvedValue({
      hasVoted: false,
      participants: 20,
    });

    await expect(getAppStateService(10)).rejects.toThrow(
      "Challenge mal configuré"
    );
  });
});
