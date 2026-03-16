export interface AppState {
  serverTime: string;

  currentChallenge: {
    id: number;
    endsAt: string;
    participants: number;
  };

  vote: {
    challengeId: number;
    endsAt: string;
    canVote: boolean;
    hasVoted: boolean;
    participants: number;
  };
}
