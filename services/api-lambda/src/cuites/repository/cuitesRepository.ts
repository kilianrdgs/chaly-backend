import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import type { UserStats } from "../../users/service/models/userDto";

export class CuitesRepository {
	async getUserStats(userId: number) {
		try {
			const totalCuites = await prisma.cuites.count({
				where: {
					Id_User: userId,
				},
			});

			const userCuites = await prisma.cuites.findMany({
				where: {
					Id_User: userId,
				},
				select: {
					Created_at: true,
				},
				orderBy: {
					Created_at: "desc",
				},
			});

			let streakDays = 0;

			if (userCuites.length === 0) {
				streakDays = 0;
			} else {
				const now = new Date();
				const today = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
				);
				const latestCuiteDate = new Date(userCuites[0].Created_at);
				const latestCuiteDay = new Date(
					latestCuiteDate.getFullYear(),
					latestCuiteDate.getMonth(),
					latestCuiteDate.getDate(),
				);

				if (today.getTime() - latestCuiteDay.getTime() > 24 * 60 * 60 * 1000) {
					streakDays = 0;
				} else {
					streakDays = 1;
					const cuiteDaysMap = new Map<string, boolean>();

					const latestDateStr = latestCuiteDay.toISOString().split("T")[0];
					cuiteDaysMap.set(latestDateStr, true);

					for (let i = 1; i < userCuites.length; i++) {
						const cuiteDate = new Date(userCuites[i].Created_at);
						const cuiteDay = new Date(
							cuiteDate.getFullYear(),
							cuiteDate.getMonth(),
							cuiteDate.getDate(),
						);

						const cuiteDayStr = cuiteDay.toISOString().split("T")[0];

						if (cuiteDaysMap.has(cuiteDayStr)) {
							continue;
						}

						const expectedPrevDay = new Date(latestCuiteDay);
						expectedPrevDay.setDate(expectedPrevDay.getDate() - streakDays);

						const expectedPrevDayStr = expectedPrevDay
							.toISOString()
							.split("T")[0];
						const cuiteDayTime = cuiteDay.getTime();
						const expectedPrevDayTime = expectedPrevDay.getTime();

						if (cuiteDayStr === expectedPrevDayStr) {
							streakDays++;
							cuiteDaysMap.set(cuiteDayStr, true);
						} else if (cuiteDayTime > expectedPrevDayTime) {
						} else {
							break;
						}
					}
				}
			}

			return {
			totalCuites,
			streakDays,
		} satisfies UserStats;
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des statistiques utilisateur:",
				error,
			);
			return new CustomError(
				"Erreur lors de la récupération des statistiques utilisateur",
				StatusCodeEnum.InternalServerError,
			);
		}
	}

	async getAllCuiteForUser(
		userId: number,
	): Promise<{ Id: number; ImageUrl: string | null }[] | CustomError> {
		try {
			const cuites = await prisma.cuites.findMany({
				where: {
					Id_User: userId,
				},
				select: {
					Id: true,
					ImageUrl: true,
				},
			});
			return cuites;
		} catch (error) {
			console.error("Erreur lors de la récupération des cuites:", error);
			return new CustomError(
				"Erreur lors de la  récupération des cuites",
				StatusCodeEnum.InternalServerError,
			);
		}
	}

	async deleteAllCuiteForUser(userId: number) {
		try {
			await prisma.cuites.deleteMany({
				where: {
					Id_User: userId,
				},
			});
			return;
		} catch (error) {
			console.error("Erreur lors de la supprèssion des cuites:", error);
			return new CustomError(
				"Erreur lors de la supprèssion des cuites",
				StatusCodeEnum.InternalServerError,
			);
		}
	}
}
