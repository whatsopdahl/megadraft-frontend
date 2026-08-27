import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { OrderType, SportLeague } from '../ws/types';
import { RosterConfig, ROSTER_POSITIONS, computeTotalRounds } from '../rosterConfig';
import { TeamInput } from '../api/draftApi';

export interface DraftSettingsFormValues {
  name: string;
  orderType: OrderType;
  pickTimerSeconds: number;
  rosterConfig: RosterConfig;
  scheduledStartTime: string;
  teams: TeamInput[];
}

interface DraftSettingsFormProps {
  form: DraftSettingsFormValues;
  onChange: React.Dispatch<React.SetStateAction<DraftSettingsFormValues>>;
  disabled?: boolean;
  // The logged-in user's own email - whichever team row matches it is theirs,
  // so that email is locked to prevent handing their own team to someone else.
  currentUserEmail?: string | null;
}

const LEAGUES = Object.keys(ROSTER_POSITIONS) as SportLeague[];

function parseCount(value: string): number {
  const count = parseInt(value, 10);
  return Number.isNaN(count) ? 0 : count;
}

const DraftSettingsForm: React.FC<DraftSettingsFormProps> = ({ form, onChange, disabled, currentUserEmail }) => {
  const addTeam = () => {
    onChange((prev) => ({ ...prev, teams: [...prev.teams, { name: '', email: '' }] }));
  };

  const removeTeam = (index: number) => {
    onChange((prev) => ({ ...prev, teams: prev.teams.filter((_, i) => i !== index) }));
  };

  const updateTeamAt = (index: number, field: keyof TeamInput, value: string) => {
    onChange((prev) => {
      const newTeams = [...prev.teams];
      newTeams[index] = { ...newTeams[index], [field]: value };
      return { ...prev, teams: newTeams };
    });
  };

  const updatePositionCount = (league: SportLeague, position: string, value: string) => {
    onChange((prev) => ({
      ...prev,
      rosterConfig: {
        ...prev.rosterConfig,
        [league]: {
          ...prev.rosterConfig[league],
          positions: { ...prev.rosterConfig[league].positions, [position]: parseCount(value) },
        },
      },
    }));
  };

  const updateBench = (league: SportLeague, value: string) => {
    onChange((prev) => ({
      ...prev,
      rosterConfig: {
        ...prev.rosterConfig,
        [league]: { ...prev.rosterConfig[league], bench: parseCount(value) },
      },
    }));
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="Draft Name"
        value={form.name}
        onChange={(e) => onChange((prev) => ({ ...prev, name: e.target.value }))}
        disabled={disabled}
        fullWidth
      />

      <TextField
        label="Draft Date & Time"
        type="datetime-local"
        value={form.scheduledStartTime}
        onChange={(e) => onChange((prev) => ({ ...prev, scheduledStartTime: e.target.value }))}
        slotProps={{ inputLabel: { shrink: true } }}
        disabled={disabled}
        fullWidth
      />

      <FormControl fullWidth>
        <InputLabel>Order Type</InputLabel>
        <Select
          value={form.orderType}
          label="Order Type"
          onChange={(e) => onChange((prev) => ({ ...prev, orderType: e.target.value as OrderType }))}
          disabled={disabled}
        >
          <MenuItem value="snake">Snake</MenuItem>
          <MenuItem value="linear">Linear</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Pick Timeout (seconds)"
        type="number"
        value={form.pickTimerSeconds}
        onChange={(e) => onChange((prev) => ({ ...prev, pickTimerSeconds: parseInt(e.target.value, 10) }))}
        disabled={disabled}
        fullWidth
      />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Roster Configuration
        </Typography>
        <Stack spacing={2}>
          {LEAGUES.map((league) => (
            <Box key={league}>
              <Typography variant="caption" color="textSecondary">
                {league}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }} useFlexGap>
                {ROSTER_POSITIONS[league].map((position) => (
                  <TextField
                    key={position}
                    label={position}
                    type="number"
                    value={form.rosterConfig[league].positions[position] ?? 0}
                    onChange={(e) => updatePositionCount(league, position, e.target.value)}
                    disabled={disabled}
                    size="small"
                    sx={{ width: 90 }}
                  />
                ))}
                <TextField
                  label="Bench"
                  type="number"
                  value={form.rosterConfig[league].bench}
                  onChange={(e) => updateBench(league, e.target.value)}
                  disabled={disabled}
                  size="small"
                  sx={{ width: 90 }}
                />
              </Stack>
            </Box>
          ))}
          <Typography variant="body2" color="textSecondary">
            Total Rounds: {computeTotalRounds(form.rosterConfig)}
          </Typography>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Teams
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
          Each team's owner is whoever logs in with the matching email - no separate invite or join step.
        </Typography>
        <Stack spacing={1}>
          {form.teams.map((team, index) => {
            const isOwnTeam =
              !!currentUserEmail && team.email.toLowerCase() === currentUserEmail.toLowerCase();
            return (
              <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label={`Team ${index + 1} Name`}
                  value={team.name}
                  onChange={(e) => updateTeamAt(index, 'name', e.target.value)}
                  disabled={disabled}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Owner Email"
                  type="email"
                  value={team.email}
                  onChange={(e) => updateTeamAt(index, 'email', e.target.value)}
                  disabled={disabled || isOwnTeam}
                  helperText={isOwnTeam ? 'This is you' : undefined}
                  fullWidth
                  size="small"
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeTeam(index)}
                  disabled={disabled || form.teams.length === 1}
                >
                  <Delete />
                </IconButton>
              </Box>
            );
          })}
          <Button variant="outlined" size="small" startIcon={<Add />} onClick={addTeam} disabled={disabled}>
            Add Team
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default DraftSettingsForm;
