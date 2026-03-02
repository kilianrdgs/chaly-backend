import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

export async function generateTokensService(userIdToToken: number) {
	const repsonseAccessToken = await generateAccessToken(userIdToToken);
	const responseRefreshToken = await generateRefreshToken(userIdToToken);

	return {
		accessToken: repsonseAccessToken,
		refreshToken: responseRefreshToken,
	};
}
