import React from 'react';
import { Box } from '@mui/material';
import { DraftPick, FantasyTeam, SportLeague } from '../ws/types';
import { RosterConfig } from '../rosterConfig';
import Roster from './Roster';

interface TeamRostersProps {
  teams: FantasyTeam[];
  picks: DraftPick[];
  sportLeagues: SportLeague[];
  rosterConfig?: RosterConfig;
}

const TeamRosters: React.FC<TeamRostersProps> = ({ teams, picks, sportLeagues, rosterConfig }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
    {teams.map((team) => (
      <Roster
        key={team.fantasyTeamId}
        title={`${team.name}'s Roster`}
        sportLeagues={sportLeagues}
        rosterConfig={rosterConfig}
        picks={picks}
        fantasyTeamId={team.fantasyTeamId}
      />
    ))}
  </Box>
);

export default TeamRosters;
