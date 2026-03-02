// cuites/service/updatePendingCuite.service.ts
import { updatePendingCuiteRepo } from "../repository/updatePendingCuite.repo";
import type { ServiceDeps } from "./types";

export async function updatePendingCuiteService(
	deps: ServiceDeps,
	userId: number,
	titre: string,
	description: string | null,
) {
	const result = await updatePendingCuiteRepo(userId, titre, description, true);
	return result;
}
