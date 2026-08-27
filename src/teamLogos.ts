import type { SportLeague } from './ws/types';

// ESPN's team abbreviation (Player.realTeam) doesn't always match this
// project's logo filenames under frontend/public/logos/{nba,nfl} - only the
// mismatches need listing here, everything else is a lowercase 1:1 match.
const NBA_LOGO_SLUGS: Record<string, string> = {
  NOP: 'no',
  GSW: 'gs',
  NYK: 'ny',
  PHL: 'phi',
  PHO: 'phx',
  SAS: 'sa',
  UTA: 'utah',
  WAS: 'wsh',
};

/** Returns null for free agents ("FA") or any team with no logo asset. */
export function teamLogoSrc(sportLeague: SportLeague, realTeam: string): string | null {
  if (!realTeam || realTeam === 'FA') {
    return null;
  }
  const slug = sportLeague === 'NBA' ? (NBA_LOGO_SLUGS[realTeam] ?? realTeam.toLowerCase()) : realTeam.toLowerCase();
  return `/logos/${sportLeague.toLowerCase()}/${slug}.png`;
}
