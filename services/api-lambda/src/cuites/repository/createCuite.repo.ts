import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import { getChalyDay } from "../../utils/chalyDay";

export async function createCuiteRepo(
  UserId: number,
  data: {
    Titre?: string | null;
    Description?: string | null;
    ImageUrl?: string | null;
    Address?: string | null;
    IsDaily: boolean;
  },
  reponseLastChallengeId?: number
) {
  const chalyDay = getChalyDay();

  try {
    const r = await prisma.cuites.create({
      data: {
        Id_User: UserId,
        Titre: data.Titre ?? undefined,
        Description: data.Description ?? undefined,
        ImageUrl: data.ImageUrl ?? undefined,
        Address: data.Address ?? undefined,
        Id_Challenge: reponseLastChallengeId ?? null,
        ChalyDay: chalyDay,
        IsDaily: data.IsDaily,
      },
      select: { Id: true },
    });
    return r.Id;
  } catch (e) {
    console.error("createCuiteRepo error:", e);
    throw new CustomError(
      "Cuite non insérée en base",
      StatusCodeEnum.InternalServerError
    );
  }
}
