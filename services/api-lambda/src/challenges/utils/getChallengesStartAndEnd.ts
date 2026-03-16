import { DateTime } from "luxon";

export const CUT_HOUR = 20;

export function getChallengeStartAndEnd() {
  const nowParis = DateTime.now().setZone("Europe/Paris");

  // Si on est après CUT_HOUR h → start = aujourd’hui CUT_HOUR h
  // Sinon → start = hier CUT_HOUR h

  const postStartLocal =
    nowParis.hour >= CUT_HOUR
      ? nowParis.set({ hour: CUT_HOUR, minute: 0, second: 0, millisecond: 0 })
      : nowParis
          .minus({ days: 1 })
          .set({ hour: CUT_HOUR, minute: 0, second: 0, millisecond: 0 });

  // heure de vote = +22h
  const postEndLocal = postStartLocal.plus({ hours: 24 });

  // heure de fin de vote = +1j
  const voteEndUtc = postStartLocal.plus({ hours: 25 });

  return {
    postStartUtc: postStartLocal.toUTC().toJSDate(),
    postEndUtc: postEndLocal.toUTC().toJSDate(),
    voteEndUtc: voteEndUtc.toUTC().toJSDate(),
  };
}
