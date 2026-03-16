import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";

export interface SearchUserResult {
	Id: number;
	Pseudo: string;
	PhotoUrl: string | null;
	XpTotal: number;
	IsVerified: boolean;
	IsCertified: boolean;
}

export async function searchUsersRepo(
	prefix: string,
	limit = 10,
): Promise<SearchUserResult[] | CustomError> {
	try {
		const users = await prisma.users.findMany({
			where: {
				...(prefix
					? {
							Pseudo: {
								startsWith: prefix,
								mode: "insensitive",
							},
						}
					: {}),
			},
			select: {
				Id: true,
				Pseudo: true,
				PhotoUrl: true,
				XpTotal: true,
				IsVerified: true,
				IsCertified: true,
				LastActiveAt: true,
			},
			orderBy: [
				{
					LastActiveAt: {
						sort: "desc",
						nulls: "last",
					},
				},
			],
			take: limit,
		});

		return users.map((user) => ({
			Id: user.Id,
			Pseudo: user.Pseudo || "",
			PhotoUrl: user.PhotoUrl,
			XpTotal: user.XpTotal,
			IsVerified: user.IsVerified,
			IsCertified: user.IsCertified ?? false,
		}));
	} catch (error) {
		console.error("Erreur lors de la recherche d'utilisateurs. Erreur:", error);
		return new CustomError(
			"Erreur lors de la recherche d'utilisateurs.",
			StatusCodeEnum.InternalServerError,
		);
	}
}
