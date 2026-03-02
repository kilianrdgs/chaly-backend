export type CuiteScrollData = {
	Id: number | null;
	Titre: string | null;
	UserPseudo: string | null;
	Description: string | null;
	CuiteDate: Date;
	UrlPicture: string | undefined;
	UserPicture: string | undefined;
	LikeCount: number | null;
	LikedByMe: boolean;
	CommentCount: number | null;
	IsCertified: boolean | null;
	Id_Challenge: number | null;
};
