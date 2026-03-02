export type CuiteData = {
	Id: number | null;
	UserId: number;
	Titre?: string | null;
	Description?: string | null;
	CuiteDate: Date;
	ImageUrl?: string | null;
	isPublished?: boolean;
};
