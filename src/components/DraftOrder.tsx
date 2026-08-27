import React from 'react';
import { Card, Stack, Typography, Chip, CardContent, CardHeader } from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import { FantasyTeam, OrderType } from '../ws/types';
import { teamIdForPick } from '../ws/draftOrder';
import { hashColor } from '../hashColor';
import OnTheClock from './OnTheClock';

interface DraftOrderProps {
  teams: FantasyTeam[];
  pickOrderTeamIds: string[];
  orderType: OrderType;
  currentPickNumber: number;
  totalRounds: number;
  myFantasyTeamId?: string;
  currentPickDeadline: string | null;
}

const DraftOrder: React.FC<DraftOrderProps> = ({
  teams,
  pickOrderTeamIds,
  orderType,
  currentPickNumber,
  totalRounds,
  myFantasyTeamId,
  currentPickDeadline
}) => {
  const teamCount = pickOrderTeamIds.length;
  const lastPickNumber = teamCount * totalRounds;

  const remainingPickNumbers: number[] = [];
  for (let pickNumber = currentPickNumber; pickNumber <= lastPickNumber; pickNumber++) {
    remainingPickNumbers.push(pickNumber);
  }

  const currentTeamId = teamIdForPick(pickOrderTeamIds, orderType, currentPickNumber);
  const currentTeamName = teams.find(t => t.fantasyTeamId == currentTeamId);

  return (
    <Card>
      <CardHeader title="Draft Order" />
      <CardContent>

        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto' }}>
          <OnTheClock
            teamName={currentTeamName?.name || 'Unknown'}
            pickOrderTeamIds={pickOrderTeamIds}
            currentPickNumber={currentPickNumber}
            currentPickDeadline={currentPickDeadline}
            totalRounds={totalRounds}
          />
          {remainingPickNumbers.map((pickNumber) => {
            const isCurrent = pickNumber === currentPickNumber;
            const round = Math.floor((pickNumber - 1) / teamCount) + 1;
            const pickInRound = ((pickNumber - 1) % teamCount) + 1;
            const teamId = teamIdForPick(pickOrderTeamIds, orderType, pickNumber);
            const team = teams.find((t) => t.fantasyTeamId === teamId);
            const isMyTeam = !!myFantasyTeamId && teamId === myFantasyTeamId;
            const cardColor = isMyTeam ? team?.color : hashColor(teamId);

            return (
              <Stack
                key={pickNumber}
                sx={{
                  minWidth: 130,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: cardColor || 'divider',
                  backgroundColor: isCurrent ? cardColor : 'transparent',
                  color: isCurrent ? 'primary.contrastText' : 'text.primary',
                  p: 1,
                  flexGrow: '0 1',
                  alignItems: 'center'
                }}
                direction="column"
                spacing={1}
              >
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
                    {team?.name ?? 'Unknown'}
                  </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.85 }}>
                  Round {round} · Pick {pickInRound}
                </Typography>
                  {team?.autodraft && (
                    <Chip
                      icon={<SmartToy sx={{ fontSize: 14 }} />}
                      label="Autodraft"
                      size="small"
                      sx={{ height: 18, fontSize: 10 }}
                    />
                  )}
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DraftOrder;
