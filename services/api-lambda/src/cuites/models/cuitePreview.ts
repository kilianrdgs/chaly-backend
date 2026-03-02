export class CuitePreview {
	constructor(
		public Id: number | null,
		public Titre: string | null,
		public UserPseudo: string,
		public Description: string | null,
		public CuiteDate: Date,
		public UrlPicture: string | undefined,
	) {}
}
