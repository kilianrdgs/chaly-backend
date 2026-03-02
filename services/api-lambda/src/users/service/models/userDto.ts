import type { XpInfo } from "../../../globals/xpModel";

export default class UserDto {
	constructor(
		public Id: number,
		public Pseudo: string | null,
		public PhotoUrl: string | null,
		public XpTotal: XpInfo,
		public IsVerified: boolean,
		public IsCertified: boolean,
		public Description: string | null,
		public BackgroundName: string | null,
		public Moderator: boolean,
		public stats: UserStats | null,
	) {}
}
export class UserStats {
	constructor(
		public totalCuites: number,
		public streakDays: number,
	) {}
}
