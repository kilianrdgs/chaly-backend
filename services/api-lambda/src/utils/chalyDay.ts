import { DateTime } from "luxon";
import { CUT_HOUR } from "../challenges/utils/getChallengesStartAndEnd";

export function getChalyDay(now = DateTime.now()): string {
  const parisNow = now.setZone("Europe/Paris");

  const day =
    parisNow.hour < CUT_HOUR
      ? parisNow.minus({ days: 1 }).toISODate()
      : parisNow.toISODate();

  if (!day) {
    throw new Error("Invalid DateTime in getChalyDay");
  }

  return day;
}

getChalyDay();
