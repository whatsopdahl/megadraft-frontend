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

export interface DraftSettingsFormValues {
  name: string;
  orderType: OrderType;
  pickTimerSeconds: number;
  rosterConfig: RosterConfig;
  scheduledStartTime: string;
  draftPassword: string;
  teamNames: string[];
}

interface DraftSettingsFormProps {
  form: DraftSettingsFormValues;
  onChange: React.Dispatch<React.SetStateAction<DraftSettingsFormValues>>;
  passwordLabel: string;
  passwordHelperText?: string;
  disabled?: boolean;
}

const LEAGUES = Object.keys(ROSTER_POSITIONS) as SportLeague[];

function parseCount(value: string): number {
  const count = parseInt(value, 10);
  return Number.isNaN(count) ? 0 : count;
}

const DraftSettingsForm: React.FC<DraftSettingsFormProps> = ({
  form,
  onChange,
  passwordLabel,
  passwordHelperText,
  disabled,
}) => {
  const addTeamName = () => {
    onChange((prev) => ({ ...prev, teamNames: [...prev.teamNames, ''] }));
  };

  const removeTeamName = (index: number) => {
    onChange((prev) => ({ ...prev, teamNames: prev.teamNames.filter((_, i) => i !== index) }));
  };

  const updateTeamNameAt = (index: number, value: string) => {
    onChange((prev) => {
      const newTeamNames = [...prev.teamNames];
      newTeamNames[index] = value;
      return { ...prev, teamNames: newTeamNames };
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

      <TextField
        label={passwordLabel}
        type="password"
        value={form.draftPassword}
        onChange={(e) => onChange((prev) => ({ ...prev, draftPassword: e.target.value }))}
        helperText={passwordHelperText}
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
        <Stack spacing={1}>
          {form.teamNames.map((name, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label={`Team ${index + 1}`}
                value={name}
                onChange={(e) => updateTeamNameAt(index, e.target.value)}
                disabled={disabled}
                fullWidth
                size="small"
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => removeTeamName(index)}
                disabled={disabled || form.teamNames.length === 1}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" size="small" startIcon={<Add />} onClick={addTeamName} disabled={disabled}>
            Add Team
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default DraftSettingsForm;
