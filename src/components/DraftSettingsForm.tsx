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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Delete, DragIndicator } from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { OrderType, SportLeague } from '../ws/types';
import { RosterConfig, ROSTER_POSITIONS, computeTotalRounds } from '../rosterConfig';
import { TeamInput } from '../api/draftApi';

// A team row needs a stable identity for drag-and-drop tracking that survives
// edits to its fields - `fantasyTeamId` only exists once a team is saved, so
// new/unsaved rows need this client-only key instead.
export interface DraftTeamFormValue extends TeamInput {
  key: string;
}

export interface DraftSettingsFormValues {
  name: string;
  orderType: OrderType;
  pickTimerSeconds: number;
  rosterConfig: RosterConfig;
  scheduledStartTime: string;
  teams: DraftTeamFormValue[];
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

interface SortableTeamRowProps {
  team: DraftTeamFormValue;
  index: number;
  disabled?: boolean;
  isOwnTeam: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onAutodraftChange: (value: boolean) => void;
  onRemove: () => void;
  removeDisabled: boolean;
}

const SortableTeamRow: React.FC<SortableTeamRowProps> = ({
  team,
  index,
  disabled,
  isOwnTeam,
  onNameChange,
  onEmailChange,
  onAutodraftChange,
  onRemove,
  removeDisabled,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: team.key,
    disabled,
  });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', opacity: isDragging ? 0.5 : 1, justifyContent: 'stretch' }}
    >
      <IconButton
        size="small"
        disabled={disabled}
        {...attributes}
        {...listeners}
        sx={{ cursor: disabled ? 'default' : 'grab', touchAction: 'none' }}
      >
        <DragIndicator fontSize="small" />
      </IconButton>
      <Stack direction="column" sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start'}}>
          <TextField
            label={`Team ${index + 1} Name`}
            value={team.name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            fullWidth
            size="small"
          />
          <TextField
            label="Owner Email"
            type="email"
            value={team.email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={disabled || isOwnTeam}
            helperText={isOwnTeam ? 'This is you' : undefined}
            fullWidth
            size="small"
          />
          <IconButton size="small" color="error" onClick={onRemove} disabled={removeDisabled}>
            <Delete />
          </IconButton>
        </Stack>
        <FormControlLabel
          sx={{ flexShrink: 0, mr: 6, alignSelf: 'flex-end'}}
          control={
            <Switch
              checked={team.autodraft ?? false}
              onChange={(e) => onAutodraftChange(e.target.checked)}
              disabled={disabled}

            />
          }
          label="Autodraft"
        />
      </Stack>
    </Box>
  );
};

const DraftSettingsForm: React.FC<DraftSettingsFormProps> = ({ form, onChange, disabled, currentUserEmail }) => {
  const addTeam = () => {
    onChange((prev) => ({
      ...prev,
      teams: [...prev.teams, { name: '', email: '', autodraft: false, key: crypto.randomUUID() }],
    }));
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

  const updateTeamAutodraftAt = (index: number, autodraft: boolean) => {
    onChange((prev) => {
      const newTeams = [...prev.teams];
      newTeams[index] = { ...newTeams[index], autodraft };
      return { ...prev, teams: newTeams };
    });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleTeamDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onChange((prev) => {
      const oldIndex = prev.teams.findIndex((t) => t.key === active.id);
      const newIndex = prev.teams.findIndex((t) => t.key === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return { ...prev, teams: arrayMove(prev.teams, oldIndex, newIndex) };
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
          Drag a row by its handle to set draft order.
        </Typography>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTeamDragEnd}>
          <SortableContext items={form.teams.map((t) => t.key)} strategy={verticalListSortingStrategy}>
            <Stack spacing={1}>
              {form.teams.map((team, index) => {
                const isOwnTeam =
                  !!currentUserEmail && team.email.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <SortableTeamRow
                    key={team.key}
                    team={team}
                    index={index}
                    disabled={disabled}
                    isOwnTeam={isOwnTeam}
                    onNameChange={(value) => updateTeamAt(index, 'name', value)}
                    onEmailChange={(value) => updateTeamAt(index, 'email', value)}
                    onAutodraftChange={(value) => updateTeamAutodraftAt(index, value)}
                    onRemove={() => removeTeam(index)}
                    removeDisabled={!!disabled || form.teams.length === 1}
                  />
                );
              })}
              <Button variant="outlined" size="small" startIcon={<Add />} onClick={addTeam} disabled={disabled}>
                Add Team
              </Button>
            </Stack>
          </SortableContext>
        </DndContext>
      </Box>
    </Stack>
  );
};

export default DraftSettingsForm;
