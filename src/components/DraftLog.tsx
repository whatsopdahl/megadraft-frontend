import React from 'react';
import { Card, CardHeader, CardContent, Stack, Typography, Chip, Divider, Box } from '@mui/material';
import { DraftPick, FantasyTeam } from '../ws/types';
import { hashColor } from '../hashColor';

interface DraftLogProps {
  picks: DraftPick[];
  teams: FantasyTeam[];
}

const DraftLog: React.FC<DraftLogProps> = ({ picks, teams }) => {
  const teamCount = teams.length;
  const mostRecentFirst = picks.slice().sort((a, b) => b.pickNumber - a.pickNumber);
  const roundOf = (pickNumber: number) => Math.floor((pickNumber - 1) / teamCount) + 1;
  const pickInRoundOf = (pickNumber: number) => ((pickNumber - 1) % teamCount) + 1;

  return (
    <Card>
      <CardHeader title="Draft Log" />
      <CardContent>
        <Stack spacing={1}>
          {mostRecentFirst.map((pick, index) => {
            const team = teams.find((t) => t.fantasyTeamId === pick.fantasyTeamId);
            const round = roundOf(pick.pickNumber);
            const previousRound = index > 0 ? roundOf(mostRecentFirst[index - 1].pickNumber) : null;
            const teamColor = team?.color || hashColor(pick.fantasyTeamId);

            return (
              <React.Fragment key={pick.pickNumber}>
                {previousRound !== null && previousRound !== round && (
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" color="textSecondary">
                      Round {round}
                    </Typography>
                  </Divider>
                )}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                    borderLeft: '4px solid',
                    borderLeftColor: teamColor,
                    pl: 1
                  }}
                >
                  <Typography variant="caption" color="textSecondary" sx={{ width: 56, flexShrink: 0 }}>
                    R{round} · P{pickInRoundOf(pick.pickNumber)}
                  </Typography>
                  <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={`/logos/${pick.sportLeague.toLowerCase()}.png`}
                        alt={pick.sportLeague}
                        sx={{ height: 14, width: 14, objectFit: 'contain', flexShrink: 0 }}
                      />
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {pick.playerName}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="textSecondary" noWrap>
                      {team?.name ?? 'Unknown team'}
                    </Typography>
                  </Stack>
                  {pick.auto && <Chip label="Auto" size="small" sx={{ height: 18, fontSize: 10 }} />}
                </Stack>
              </React.Fragment>
            );
          })}
          {mostRecentFirst.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
              No picks yet.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DraftLog;
