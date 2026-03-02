class LastCuiteByUser {
	userId: number;
	pseudo: string | null;
	tokenNotification: string | null;
	lastCuite: {
		id: number;
		userId: number;
		createdAt: Date;
	} | null;

	constructor(
		userId: number,
		pseudo: string | null,
		tokenNotification: string | null,
		lastCuite: {
			id: number;
			userId: number;
			createdAt: Date;
		} | null,
	) {
		this.userId = userId;
		this.pseudo = pseudo;
		this.tokenNotification = tokenNotification;
		this.lastCuite = lastCuite;
	}
}
