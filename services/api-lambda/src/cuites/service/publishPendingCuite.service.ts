// cuites/service/publishPendingCuite.service.ts
import { publishPendingCuiteRepo } from "../repository/publishPendingCuite.repo";
import type { ServiceDeps } from "./types";

export async function publishPendingCuiteService(
	deps: ServiceDeps,
	userId: number,
) {
	const result = await publishPendingCuiteRepo(userId);
	return result;
}
