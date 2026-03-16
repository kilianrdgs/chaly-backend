export default class UserWithCuitesCount {
	constructor(
		public pseudo: string | null,
		public photoUrl: string | null,
		public IsCertified: boolean,
		public cuitesCount: number,
	) {}
}

export interface UsersGlobalPostResult {
	users: UserWithCuitesCount[];
	nextCursor: string | null;
}
