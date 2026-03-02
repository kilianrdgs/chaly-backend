export class Xp {
	constructor(public xpTotal: number) {}

	getCurrentLevel(): number {
		const levelConstant = 0.1;
		return Math.floor(levelConstant * Math.sqrt(this.xpTotal));
	}

	getXpForLevel(level: number): number {
		const levelConstant = 0.1;
		return (level / levelConstant) ** 2;
	}

	getPercentageToNextLevel(): number {
		const currentLevel = this.getCurrentLevel();
		const xpForCurrentLevel = this.getXpForLevel(currentLevel);
		const xpForNextLevel = this.getXpForLevel(currentLevel + 1);

		const xpInCurrentLevel = this.xpTotal - xpForCurrentLevel;
		const xpRequiredForNextLevel = xpForNextLevel - xpForCurrentLevel;

		return Math.min(
			Math.floor((xpInCurrentLevel / xpRequiredForNextLevel) * 100),
			99,
		);
	}

	getXpRemainingToNextLevel(): number {
		const currentLevel = this.getCurrentLevel();
		const xpForNextLevel = this.getXpForLevel(currentLevel + 1);

		return xpForNextLevel - this.xpTotal;
	}
}

export class XpInfo {
	public xpTotal: number;
	public currentLevel: number;
	public percentageToNextLevel: number;
	public xpRemainingToNextLevel: number;

	constructor(xpTotal: number) {
		const xpSystem = new Xp(xpTotal);

		this.xpTotal = xpTotal;
		this.currentLevel = xpSystem.getCurrentLevel();
		this.percentageToNextLevel = xpSystem.getPercentageToNextLevel();
		this.xpRemainingToNextLevel = xpSystem.getXpRemainingToNextLevel();
	}
}
