// repo/challenges/winners.repo.ts
import type { CuiteScrollData } from "../../cuites/models/cuiteScroll.model";
import { prisma } from "../../globals/bdd";

export async function getChallengeWinnersRepo(
	challengeId: number,
	meUserId: number,
	limit = 3,
) {
	const top = await prisma.likes.groupBy({
		by: ["Id_Cuite"],
		where: { Cuite: { Id_Challenge: challengeId } },
		_count: { _all: true },
		orderBy: { _count: { Id_Cuite: "desc" } },
		take: limit,
	});
	const ids = top.map((t) => t.Id_Cuite);
	if (!ids.length) return [];

	const [cuits, myLikes, commentsCount] = await Promise.all([
		prisma.cuites.findMany({
			where: { Id: { in: ids } },
			select: {
				Id: true,
				Id_Challenge: true,
				Titre: true,
				Description: true,
				Created_at: true,
				ImageUrl: true,
				User: { select: { Pseudo: true, PhotoUrl: true, IsCertified: true } },
			},
		}),
		prisma.likes.findMany({
			where: { Id_User: meUserId, Id_Cuite: { in: ids } },
			select: { Id_Cuite: true },
		}),
		prisma.comments.groupBy({
			by: ["Id_Cuite"],
			where: { Id_Cuite: { in: ids } },
			_count: true,
		}),
	]);

	const likeMap = new Map(top.map((t) => [t.Id_Cuite, t._count?._all ?? 0]));
	const likedSet = new Set(myLikes.map((l) => l.Id_Cuite));
	const commentMap = new Map(
		commentsCount.map((c) => [c.Id_Cuite, c._count as number]),
	);
	const cuitsMap = new Map(cuits.map((c) => [c.Id, c]));

	// Remettre dans l'ordre des "top"
	//   return ids.map((id) => {
	//     const r = cuitsMap.get(id)!;
	//     const LikeCount = likeMap.get(id) ?? 0;
	//     const CommentCount = commentMap.get(id) ?? 0;
	//     return {
	//       Id: r.Id,
	//       Titre: r.Titre ?? null,
	//       UserPseudo: r.User.Pseudo,
	//       Description: r.Description ?? null,
	//       CuiteDate: r.Created_at,
	//       UrlPicture: r.ImageUrl ?? "",
	//       UserPicture: r.User.PhotoUrl ?? undefined,
	//       LikeCount,
	//       LikedByMe: likedSet.has(id),
	//       CommentCount,
	//       IsCertified: r.User.IsCertified,
	//       Id_Challenge: r.Id_Challenge,
	//     } as CuiteScrollData;
	//   });
}
