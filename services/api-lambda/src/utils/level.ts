export function calculateLevel(xpTotal: number) {
  const xpBase = 100;
  const xpGrowth = 1.2;

  let level = 1;
  let required = xpBase;
  let remainingXp = xpTotal;

  while (remainingXp >= required) {
    remainingXp -= required;
    level++;
    required = Math.floor(required * xpGrowth);
  }

  return {
    level,
    xpIntoLevel: remainingXp,
    xpNeededForNextLevel: required,
    progress: remainingXp / required,
  };
}
