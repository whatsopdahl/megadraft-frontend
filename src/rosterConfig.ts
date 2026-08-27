import type { SportLeague } from './ws/types';

// The only positions syncEspnPlayers actually writes to the Players table -
// mirrors lambda/src/lib/rosterConfig.ts, kept in sync manually (the two
// repos don't share a package, same as SportLeague/OrderType elsewhere).
export const ROSTER_POSITIONS: Record<SportLeague, string[]> = {
  NBA: ['PG', 'SG', 'SF', 'PF', 'C'],
  NFL: ['QB', 'RB', 'WR', 'TE', 'K', 'D/ST'],
};

export interface LeagueRosterConfig {
  positions: Record<string, number>;
  bench: number;
}

export interface RosterConfig {
  NBA: LeagueRosterConfig;
  NFL: LeagueRosterConfig;
}

export const DEFAULT_ROSTER_CONFIG: RosterConfig = {
  NBA: { positions: { PG: 1, SG: 1, SF: 1, PF: 1, C: 1 }, bench: 3 },
  NFL: { positions: { QB: 1, RB: 2, WR: 2, TE: 1, K: 1, 'D/ST': 1 }, bench: 3 },
};

export function computeTotalRounds(rosterConfig: RosterConfig): number {
  return (Object.keys(ROSTER_POSITIONS) as SportLeague[]).reduce((sum, league) => {
    const leagueConfig = rosterConfig[league];
    const positionsSum = Object.values(leagueConfig.positions).reduce((s, n) => s + n, 0);
    return sum + positionsSum + leagueConfig.bench;
  }, 0);
}

interface RosterEntryLike {
  position: string;
  sportLeague: SportLeague;
}

/** Mirrors lambda/src/lib/rosterConfig.ts's hasRosterCapacity exactly. */
export function hasRosterCapacity(
  rosterConfig: RosterConfig | undefined,
  teamEntries: RosterEntryLike[],
  player: RosterEntryLike,
): boolean {
  if (!rosterConfig) {
    return true;
  }

  const leagueConfig = rosterConfig[player.sportLeague];
  const leagueEntries = teamEntries.filter((e) => e.sportLeague === player.sportLeague);

  const filledPositionCounts: Record<string, number> = {};
  let benchFilled = 0;
  for (const entry of leagueEntries) {
    const configuredSlots = leagueConfig.positions[entry.position] ?? 0;
    const filled = filledPositionCounts[entry.position] ?? 0;
    if (filled < configuredSlots) {
      filledPositionCounts[entry.position] = filled + 1;
    } else {
      benchFilled += 1;
    }
  }

  const configuredPositionSlots = leagueConfig.positions[player.position] ?? 0;
  const currentPositionFilled = filledPositionCounts[player.position] ?? 0;
  if (currentPositionFilled < configuredPositionSlots) {
    return true;
  }

  return benchFilled < leagueConfig.bench;
}

export interface RosterSlotAssignment {
  league: SportLeague;
  slot: string;
  playerId: string;
}

/** Mirrors lambda/src/lib/rosterConfig.ts's assignRosterSlots exactly. */
export function assignRosterSlots(
  rosterConfig: RosterConfig,
  teamPicksInOrder: { playerId: string; position: string; sportLeague: SportLeague }[],
): RosterSlotAssignment[] {
  const assignments: RosterSlotAssignment[] = [];
  const filledCounts: Record<SportLeague, Record<string, number>> = { NBA: {}, NFL: {} };

  for (const pick of teamPicksInOrder) {
    const leagueConfig = rosterConfig[pick.sportLeague];
    const configuredSlots = leagueConfig.positions[pick.position] ?? 0;
    const filled = filledCounts[pick.sportLeague][pick.position] ?? 0;

    const slot = filled < configuredSlots ? pick.position : 'Bench';
    filledCounts[pick.sportLeague][pick.position] = filled + 1;
    assignments.push({ league: pick.sportLeague, slot, playerId: pick.playerId });
  }

  return assignments;
}
