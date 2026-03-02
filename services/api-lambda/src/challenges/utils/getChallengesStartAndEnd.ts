import { DateTime } from "luxon";

export function getChallengeStartAndEnd() {
	const nowParis = DateTime.now().setZone("Europe/Paris");

	// Si on est après 19h → start = aujourd’hui 19h
	// Sinon → start = hier 19h
	const cutHour = 19;
	const startLocal =
		nowParis.hour >= cutHour
			? nowParis.set({ hour: cutHour, minute: 0, second: 0, millisecond: 0 })
			: nowParis
					.minus({ days: 1 })
					.set({ hour: cutHour, minute: 0, second: 0, millisecond: 0 });

	const endLocal = startLocal.plus({ days: 1 });

	return {
		startUtc: startLocal.toUTC().toJSDate(),
		endUtc: endLocal.toUTC().toJSDate(),
	};
}
