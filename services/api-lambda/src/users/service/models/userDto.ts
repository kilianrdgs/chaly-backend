export type UserDto = {
  Id: number;
  Pseudo: string | null;
  PhotoUrl: string | null;
  IsVerified: boolean;
  IsCertified: boolean;
  Description: string | null;
  BackgroundName: string | null;
  Moderator: boolean;
  stats?: UserStats | null;
  levelInfo?: LevelInfo | null;
};

export type UserStats = {
  totalCuites: number;
  streakDays: number;
};

export type LevelInfo = {
  level: number;
  xpIntoLevel: number;
  xpNeededForNextLevel: number;
  progress: number;
};
