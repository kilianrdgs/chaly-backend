import { CUT_HOUR } from "../../challenges/utils/getChallengesStartAndEnd";
import { prisma } from "../../globals/bdd";

export async function getStatsRepo() {
  const now = new Date();

  // Calculer le début de la journée à CUT_HOUR h la veille (aligné avec l'heure du défi)
  // La période va toujours de CUT_HOUR h hier à CUT_HOUR h aujourd'hui
  const startOfDay = new Date(now);
  startOfDay.setDate(now.getDate() - 1);
  startOfDay.setHours(CUT_HOUR, 0, 0, 0);

  console.log("📊 Stats calculation - Start time:", startOfDay.toISOString());
  console.log("📊 Stats calculation - Current time:", now.toISOString());

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now);
  startOfMonth.setDate(now.getDate() - 30);

  // Comptes lancés en parallèle pour plus de perf
  const [total, dau, wau, mau, usersWhoPosted, photosCount, likesCount] =
    await Promise.all([
      prisma.users.count({}),
      prisma.users.count({
        where: {
          LastActiveAt: { gte: startOfDay },
        },
      }),
      prisma.users.count({
        where: {
          LastActiveAt: { gte: startOfWeek },
        },
      }),
      prisma.users.count({
        where: {
          LastActiveAt: { gte: startOfMonth },
        },
      }),
      // Compter le nombre d'utilisateurs UNIQUES qui ont posté
      prisma.cuites
        .findMany({
          where: {
            Created_at: { gte: startOfDay },
          },
          distinct: ["Id_User"],
          select: { Id_User: true },
        })
        .then((users) => {
          console.log(
            "📊 Unique users who posted:",
            users.length,
            "users:",
            users.map((u) => u.Id_User)
          );
          return users.length;
        }),
      prisma.cuites.count({
        where: {
          Created_at: { gte: startOfDay },
        },
      }),
      prisma.likes.count({
        where: {
          Cuite: {
            Created_at: { gte: startOfDay },
          },
        },
      }),
    ]);

  const avgLikesPerPhoto = photosCount > 0 ? likesCount / photosCount : 0;

  return {
    total,
    dau,
    wau,
    mau,
    usersWhoPosted,
    avgLikesPerPhoto,
  };
}
