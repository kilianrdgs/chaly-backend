import { getInfoUserByCuiteIdRepo } from "../../cuites/repository/getInfoUserByCuiteId.repo";
import type { ServiceDeps } from "../../cuites/service/types";
// cuites/service/likeCuite.service.ts
import CustomError from "../../globals/customError";
import { sendNotifService } from "../../notifications/service/sendNotification.service";
import { getSocialCountRepo } from "../repository/getSocialCount.repo";
import { likeCuiteRepo } from "../repository/likeCuite.repo";

export async function likeCuiteService(
	deps: ServiceDeps,
	cuiteId: number,
	userId: number,
) {
	const resultLike = await likeCuiteRepo(cuiteId, userId);
	if (resultLike instanceof CustomError) return resultLike;

	const responseGetSocialCountRepo = await getSocialCountRepo(cuiteId, userId);
	console.log("(***) - response", responseGetSocialCountRepo);
	if (getSocialCountRepo instanceof CustomError) return getSocialCountRepo;

	const info = await getInfoUserByCuiteIdRepo(cuiteId);
	if (info instanceof CustomError) return info;

	if (userId !== resultLike) {
		sendNotifService(deps, userId, info?.Username ?? "", 4, cuiteId);
	}
	return responseGetSocialCountRepo;
}
