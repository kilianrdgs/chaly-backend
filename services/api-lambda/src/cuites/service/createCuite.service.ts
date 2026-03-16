// cuites/service/createCuite.service.ts

import { getCurrentChallengeRepo } from "../../challenges/repository/getCurrentChallenge.repo";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

import type { CuiteData } from "../models/cuite.model";
import { createCuiteRepo } from "../repository/createCuite.repo";
import { getDailyPostingState } from "../repository/getDailyPostingState.repo";

export async function createCuiteService(cuite: CuiteData) {
  const reponseLastChallengeId = await getCurrentChallengeRepo();

  const dailyPostingState = await getDailyPostingState(cuite.UserId);

  if (dailyPostingState.hasPostedTwice) {
    throw new CustomError(
      "Limite de 2 photos atteinte pour aujourd’hui",
      StatusCodeEnum.Forbidden
    );
  }

  const isDaily = !dailyPostingState.hasPostedToday;

  const createdId = await createCuiteRepo(
    cuite.UserId,
    { ...cuite, IsDaily: isDaily },
    reponseLastChallengeId
  );

  return {
    mode: dailyPostingState.hasPostedToday ? "created_second" : "created_first",
    cuiteId: createdId,
  };
}
