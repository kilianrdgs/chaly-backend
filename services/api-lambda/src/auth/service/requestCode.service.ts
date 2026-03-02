import { requestCodeRepo } from "../repository/requestCode.repo";

export async function requestCodeService(number: string) {
	return requestCodeRepo(number);
}
