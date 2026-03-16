import countWinsRepo from "../../challenges/repository/countWins.repo";
import { CuitesRepository } from "../../cuites/repository/cuitesRepository";
import CustomError from "../../globals/customError";

export async function getUsersStats(userIds: number[]) {
  const cuitesRepo = new CuitesRepository();
  const result = new Map<number, { wins: number; streak: number }>();

  await Promise.all(
    userIds.map(async (id) => {
      const [wins, stats] = await Promise.all([
        countWinsRepo(id),
        cuitesRepo.getUserStats(id),
      ]);

      if (!(stats instanceof CustomError)) {
        result.set(id, {
          wins,
          streak: stats.streakDays,
        });
      }
    })
  );

  return result;
}
