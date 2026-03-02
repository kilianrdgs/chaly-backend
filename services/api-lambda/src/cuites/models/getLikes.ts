export type LikeUser = {
	Id: number;
	Pseudo: string | null;
	UserPicture: string | null;
};

export type GetLikesResponse = {
	count: number;
	users: LikeUser[];
};
