export function computeProgress(departedAt: Date, arrivalEta: Date, now: Date = new Date()): number {
  const total = arrivalEta.getTime() - departedAt.getTime();
  if (total <= 0) return 1;
  const elapsed = now.getTime() - departedAt.getTime();
  return Math.min(1, Math.max(0, elapsed / total));
}

export function interpolate(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
