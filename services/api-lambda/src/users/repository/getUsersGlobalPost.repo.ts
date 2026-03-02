import {
	decodeClassicCursor,
	encodeClassicCursor,
} from "../../cuites/utils/nextCursor";
import { prisma } from "../../globals/bdd";
import CustomError, { StatusCodeEnum } from "../../globals/customError";
import UserWithCuitesCount from "../service/models/userWithCuiteCount";

export async function getUsersGlobalPostRepo(
	limit: number,
	cursor: string | null,
) {
	try {
		const isCursorValid = cursor && cursor !== "null";

		const allUsers = await prisma.users.findMany({
			select: {
				Id: true,
				Pseudo: true,
				PhotoUrl: true,
				IsCertified: true,
				_count: { select: { Cuites: true } },
			},
			orderBy: [{ Cuites: { _count: "desc" } }, { Id: "asc" }],
		});

		const userObjects = allUsers.map((user) => ({
			userObject: new UserWithCuitesCount(
				user.Pseudo,
				user.PhotoUrl,
				user.IsCertified,
				user._count.Cuites,
			),
			cuitesCount: user._count.Cuites,
			id: user.Id,
		}));

		let startIndex = 0;
		if (isCursorValid) {
			const decoded = decodeClassicCursor(cursor);
			startIndex = userObjects.findIndex(
				(user) =>
					user.cuitesCount < decoded.cuitesCount ||
					(user.cuitesCount === decoded.cuitesCount && user.id > decoded.id),
			);
			if (startIndex === -1) return { users: [], nextCursor: null };
		}

		const paginatedUsers = userObjects.slice(startIndex, startIndex + limit);
		const lastUser = paginatedUsers[paginatedUsers.length - 1];
		const nextCursor =
			lastUser && startIndex + limit < userObjects.length
				? encodeClassicCursor({
						id: lastUser.id,
						cuitesCount: lastUser.cuitesCount,
					})
				: null;

		return { users: paginatedUsers.map((u) => u.userObject), nextCursor };
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des utilisateurs avec le nombre de cuites :",
			error,
		);
		return new CustomError(
			"Erreur lors de la récupération des utilisateurs avec le nombre de cuites",
			StatusCodeEnum.InternalServerError,
		);
	}
}
