import { prisma } from "../../globals/bdd";

interface GetRegistrationStatsParams {
  startDate: Date;
  endDate: Date;
}

export interface DailyRegistration {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface GrowthStats {
  currentPeriod: number;
  previousPeriod: number;
  growthFactor: number;
}

export interface RegistrationStatsResponse {
  startDate: string;
  endDate: string;
  timeseries: DailyRegistration[];
  growth: GrowthStats;
}

/**
 * Service pour récupérer les statistiques d'inscription des utilisateurs
 */
export async function getRegistrationStatsService(
  params: GetRegistrationStatsParams
): Promise<RegistrationStatsResponse> {
  const { startDate, endDate } = params;

  // Récupérer tous les utilisateurs avec leur date de création
  const users = await prisma.users.findMany({
    select: {
      Created_at: true,
    },
    orderBy: {
      Created_at: "asc",
    },
  });

  // Grouper les inscriptions par date (timezone Paris)
  const registrationsByDate = new Map<string, number>();

  users.forEach((user) => {
    const parisDateStr = user.Created_at.toLocaleString("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).split(",")[0]; // Format: YYYY-MM-DD

    registrationsByDate.set(
      parisDateStr,
      (registrationsByDate.get(parisDateStr) || 0) + 1
    );
  });

  // Créer la série temporelle avec cumul
  const timeseries: DailyRegistration[] = [];
  let cumulativeUsers = 0;

  // Générer tous les jours entre startDate et endDate
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateStr = currentDate.toLocaleDateString("en-CA", {
      timeZone: "Europe/Paris",
    }); // Format YYYY-MM-DD

    const newUsers = registrationsByDate.get(dateStr) || 0;
    cumulativeUsers += newUsers;

    timeseries.push({
      date: dateStr,
      newUsers,
      totalUsers: cumulativeUsers,
    });

    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculer la croissance : période actuelle vs période précédente de même durée
  // Calculer la durée de la période sélectionnée en millisecondes
  const periodDuration = endDate.getTime() - startDate.getTime();

  // Créer la période précédente (même durée, juste avant startDate)
  const prevPeriodEnd = new Date(startDate.getTime() - 1); // 1ms avant startDate
  const prevPeriodStart = new Date(startDate.getTime() - periodDuration);

  // Compter les inscriptions dans la période actuelle
  const currentPeriodUsers = users.filter(
    (user) => user.Created_at >= startDate && user.Created_at <= endDate
  ).length;

  // Compter les inscriptions dans la période précédente
  const previousPeriodUsers = users.filter(
    (user) =>
      user.Created_at >= prevPeriodStart && user.Created_at <= prevPeriodEnd
  ).length;

  // Calculer le facteur de croissance
  const growthFactor =
    previousPeriodUsers > 0
      ? currentPeriodUsers / previousPeriodUsers
      : currentPeriodUsers > 0
      ? Infinity
      : 0;

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    timeseries,
    growth: {
      currentPeriod: currentPeriodUsers,
      previousPeriod: previousPeriodUsers,
      growthFactor: Math.round(growthFactor * 100) / 100,
    },
  };
}
