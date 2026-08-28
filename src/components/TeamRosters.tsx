import React from 'react';
import { Grid } from '@mui/material';
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
  <Grid container spacing={2} sx={{ justifyContent: 'flex-start' }}>
    {teams.map((team) => (
      <Grid 
        size={{ xs: 12, md: 6, lg: 4 }}
        key={team.fantasyTeamId}
        >
        <Roster
          title={`${team.name}'s Roster`}
          sportLeagues={sportLeagues}
          rosterConfig={rosterConfig}
          picks={picks}
          fantasyTeamId={team.fantasyTeamId}
        />
      </Grid>
    ))}
  </Grid>
);

export default TeamRosters;
