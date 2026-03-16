import { prisma } from "../../globals/bdd";
import { ActionType } from "@prisma/client";

interface GetAnalyticsStatsParams {
  startDate: Date;
  endDate: Date;
  actionTypes?: string[];
}

export interface HourlyStats {
  hour: string;
  activeUsers: number;
}

export interface DailyAttendanceStats {
  date: string;
  peakActiveUsers: number;
  byHour: HourlyStats[];
}

export interface AnalyticsStatsResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  days: DailyAttendanceStats[];
}

const VALID_ACTION_TYPES: string[] = [
  "ACTIVITY",
  "POST_CUITE",
  "DELETE_CUITE",
  "LIKE",
  "UNLIKE",
  "COMMENT",
  "DELETE_COMMENT",
];

/**
 * Service pour récupérer les statistiques de fréquentation journalière
 */
export async function getAnalyticsStatsService(
  params: GetAnalyticsStatsParams
): Promise<AnalyticsStatsResponse> {
  const { startDate, endDate, actionTypes } = params;

  // Construction des filtres Prisma
  const whereClause: any = {
    Created_At: {
      gte: startDate,
      lte: endDate,
    },
  };

  // Ajout du filtre actionTypes si fourni (par défaut ACTIVITY pour la fréquentation)
  if (actionTypes && actionTypes.length > 0) {
    // Validation des types d'actions
    const invalidTypes = actionTypes.filter(
      (type) => !VALID_ACTION_TYPES.includes(type)
    );

    if (invalidTypes.length > 0) {
      throw new Error(
        `Invalid action types: ${invalidTypes.join(", ")}. Valid types are: ${VALID_ACTION_TYPES.join(", ")}`
      );
    }

    whereClause.Action = {
      in: actionTypes as ActionType[],
    };
  }

  // Requête Prisma avec filtres
  const analytics = await prisma.userAnalytics.findMany({
    where: whereClause,
    select: {
      Id_User: true,
      Created_At: true,
    },
    orderBy: {
      Created_At: "asc",
    },
  });

  // Grouper les logs par date
  interface LogEntry {
    userId: number;
    timestamp: Date;
  }

  const logsByDate = new Map<string, LogEntry[]>();

  analytics.forEach((item) => {
    // Convertir en heure de Paris pour le groupement par jour
    const parisDateStr = item.Created_At.toLocaleString("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).split(",")[0]; // Format: YYYY-MM-DD

    if (!logsByDate.has(parisDateStr)) {
      logsByDate.set(parisDateStr, []);
    }
    logsByDate.get(parisDateStr)!.push({
      userId: item.Id_User,
      timestamp: item.Created_At,
    });
  });

  // Calculer les stats pour chaque jour
  const days: DailyAttendanceStats[] = [];

  logsByDate.forEach((logs, date) => {
    // Map pour tracker les utilisateurs uniques par heure
    const usersByHour = new Map<string, Set<number>>();
    for (let h = 0; h < 24; h++) {
      usersByHour.set(h.toString().padStart(2, '0'), new Set());
    }

    logs.forEach(log => {
      // Extraire l'heure en fuseau horaire de Paris
      const parisTimeStr = log.timestamp.toLocaleString("en-US", {
        timeZone: "Europe/Paris",
        hour: "numeric",
        hour12: false,
      });
      const hour = parseInt(parisTimeStr, 10);

      // Vérifier que l'heure est valide (0-23)
      if (hour >= 0 && hour <= 23) {
        const hourKey = hour.toString().padStart(2, '0');
        const userSet = usersByHour.get(hourKey);
        if (userSet) {
          userSet.add(log.userId);
        }
      }
    });

    // Construire byHour dans l'ordre chronologique (00-23) comme tableau
    const byHour: HourlyStats[] = [];
    let peakActiveUsers = 0;

    for (let h = 0; h < 24; h++) {
      const hourKey = h.toString().padStart(2, '0');
      const activeUsers = usersByHour.get(hourKey)?.size || 0;
      byHour.push({
        hour: hourKey,
        activeUsers,
      });
      if (activeUsers > peakActiveUsers) {
        peakActiveUsers = activeUsers;
      }
    }

    days.push({
      date,
      peakActiveUsers,
      byHour,
    });
  });

  // Trier les jours par date décroissante
  days.sort((a, b) => b.date.localeCompare(a.date));

  return {
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    days,
  };
}
