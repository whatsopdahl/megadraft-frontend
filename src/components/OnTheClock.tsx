import React, { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';



interface OnTheClockProps {
  teamName: string;
  pickOrderTeamIds: string[];
  currentPickNumber: number;
  currentPickDeadline: string | null;
  totalRounds: number;
}

function useCountdown(deadline: string | null): number {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!deadline) {
      setRemaining(0);
      return;
    }

    const update = () => {
      setRemaining(Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000)));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return remaining;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** The live countdown for whoever is currently on the clock - only ever shows the active pick, never projected future ones. */
const OnTheClock: React.FC<OnTheClockProps> = ({
  teamName,
  pickOrderTeamIds,
  currentPickNumber,
  currentPickDeadline,
  totalRounds,
}) => {
  const remaining = useCountdown(currentPickDeadline);

  if (!currentPickDeadline) {
    return null;
  }

  const teamCount = pickOrderTeamIds.length;
  const round = Math.floor((currentPickNumber - 1) / teamCount) + 1;
  const pickInRound = ((currentPickNumber - 1) % teamCount) + 1;

  return (
    <Stack direction="column" spacing={0} sx={{ px: 2, textAlign: 'center', borderRight: 'solid 2px black' }}>
      <Typography variant="overline" color="textSecondary">
        On the Clock
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {teamName}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        Round {round} · Pick {pickInRound} / {teamCount * totalRounds}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {formatClock(remaining)}
      </Typography>
    </Stack>
  );
};

export default OnTheClock;
