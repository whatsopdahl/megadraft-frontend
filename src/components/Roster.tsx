import React from 'react';
import { Card, CardHeader, CardContent, Box, Typography, Stack } from '@mui/material';
import { DraftPick, SportLeague } from '../ws/types';
import { RosterConfig, ROSTER_POSITIONS, assignRosterSlots } from '../rosterConfig';

interface RosterProps {
  sportLeagues: SportLeague[];
  rosterConfig?: RosterConfig;
  picks: DraftPick[];
  fantasyTeamId?: string;
}

interface SlotRow {
  slot: string;
  playerName?: string;
}

/** Builds every configured slot for a league (filled + empty), in position-config order. */
function buildSlotRows(league: SportLeague, rosterConfig: RosterConfig, teamPicksInOrder: DraftPick[]): SlotRow[] {
  const leagueConfig = rosterConfig[league];
  const assignmentInput = teamPicksInOrder.map((p) => ({
    playerId: p.playerId,
    position: p.playerPosition,
    sportLeague: p.sportLeague,
  }));
  const assignments = assignRosterSlots(rosterConfig, assignmentInput).filter((a) => a.league === league);
  const rows: SlotRow[] = [];

  for (const position of ROSTER_POSITIONS[league]) {
    const configuredCount = leagueConfig.positions[position] ?? 0;
    const filledForPosition = assignments.filter((a) => a.slot === position);
    for (let i = 0; i < configuredCount; i++) {
      const assignment = filledForPosition[i];
      const pick = assignment ? teamPicksInOrder.find((p) => p.playerId === assignment.playerId) : undefined;
      rows.push({ slot: position, playerName: pick?.playerName });
    }
  }

  const benchAssignments = assignments.filter((a) => a.slot === 'Bench');
  for (let i = 0; i < leagueConfig.bench; i++) {
    const assignment = benchAssignments[i];
    const pick = assignment ? teamPicksInOrder.find((p) => p.playerId === assignment.playerId) : undefined;
    rows.push({ slot: 'Bench', playerName: pick?.playerName });
  }

  return rows;
}

const Roster: React.FC<RosterProps> = ({ sportLeagues, rosterConfig, picks, fantasyTeamId }) => {
  const myPicksInOrder = picks
    .filter((p) => p.fantasyTeamId === fantasyTeamId)
    .slice()
    .sort((a, b) => a.pickNumber - b.pickNumber);

  return (
    <Card>
      <CardHeader title="My Roster" />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sportLeagues.map((league) => (
          <Box key={league} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Box
                component="img"
                src={`/logos/${league.toLowerCase()}.png`}
                alt={league}
                sx={{ height: 18, width: 18, objectFit: 'contain' }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {league}
              </Typography>
            </Stack>
            {rosterConfig ? (
              <Stack spacing={0.5}>
                {buildSlotRows(league, rosterConfig, myPicksInOrder).map((row, index) => (
                  <Stack key={`${row.slot}-${index}`} direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ width: 48, flexShrink: 0 }}>
                      {row.slot}
                    </Typography>
                    <Typography variant="body2" color={row.playerName ? 'text.primary' : 'text.disabled'}>
                      {row.playerName ?? 'Empty'}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Stack spacing={0.5}>
                {myPicksInOrder
                  .filter((p) => p.sportLeague === league)
                  .map((p) => (
                    <Typography key={p.playerId} variant="body2">
                      {p.playerName} ({p.playerPosition})
                    </Typography>
                  ))}
              </Stack>
            )}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default Roster;
