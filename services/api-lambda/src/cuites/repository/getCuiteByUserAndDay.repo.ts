import { prisma } from "../../globals/bdd";

export async function getCuiteByUserAndDayRepo(
  UserId: number,
  chalyDay: string
) {
  try {
    const cuite = await prisma.cuites.findFirst({
      where: {
        Id_User: UserId,
        ChalyDay: chalyDay,
      },
    });
    return cuite;
  } catch (e) {
    console.error("getCuiteByUserAndDayRepo error:", e);
    return null;
  }
}
