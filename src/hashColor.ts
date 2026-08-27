/** Deterministic, distinct-looking color for a given string (e.g. an id), independent of any stored color field. */
export function hashColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 55%, 55%)`;
}
