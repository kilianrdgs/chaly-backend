import type { ServiceDeps } from "../../cuites/service/types";
import CustomError from "../../globals/customError";
import {
	searchUsersRepo,
	type SearchUserResult,
} from "../repository/searchUsers.repo";

export interface SearchUserDto {
	Id: number;
	Pseudo: string;
	PhotoUrl: string | null;
	XpTotal: number;
	IsVerified: boolean;
	IsCertified: boolean;
}

export async function searchUsersService(
	deps: ServiceDeps,
	prefix: string,
	limit = 10,
): Promise<SearchUserDto[] | CustomError> {
	const bucket = deps.bucketName ?? process.env.AWS_S3_BUCKET ?? "bucket";

	const users = await searchUsersRepo(prefix, limit);
	if (users instanceof CustomError) return users;

	const usersWithSignedUrls = await Promise.all(
		users.map(async (user) => {
			let photoUrl = user.PhotoUrl;
			if (photoUrl) {
				photoUrl = await deps.s3Service.getSignedImageUrl(
					bucket,
					photoUrl.split("amazonaws.com/")[1],
				);
			}
			return {
				...user,
				PhotoUrl: photoUrl,
			};
		}),
	);

	return usersWithSignedUrls;
}
