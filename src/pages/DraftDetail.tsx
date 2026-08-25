import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  Stack,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { getDraft, updateDraft, updateTeam } from '../api/draftApi';
import { ApiError } from '../api/client';
import { Draft, OrderType } from '../ws/types';

const ONE_HOUR_MS = 60 * 60 * 1000;

// datetime-local inputs want "YYYY-MM-DDTHH:mm" in the viewer's local time.
function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

const DraftDetail: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { idToken, userId } = useAuth();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [teamForm, setTeamForm] = useState({ name: '', color: '#1e88e5', autodraft: false });
  const [draftForm, setDraftForm] = useState({
    name: '',
    orderType: 'snake' as OrderType,
    pickTimerSeconds: 30,
    totalRounds: 10,
    scheduledStartTime: '',
    draftPassword: '',
    teamNames: [''] as string[],
  });

  const isAdmin = !!draft && draft.commissionerUserId === userId;
  const myTeam = draft?.teams.find((t) => t.ownerUserId === userId);

  useEffect(() => {
    if (!idToken || !draftId) return;

    getDraft(idToken, draftId)
      .then(({ draft }) => setDraft(draft))
      .catch(() => setDraft(null))
      .finally(() => setLoading(false));
  }, [idToken, draftId]);

  useEffect(() => {
    if (!draft) return;
    const owned = draft.teams.find((t) => t.ownerUserId === userId);
    if (owned) {
      setTeamForm({ name: owned.name, color: owned.color, autodraft: owned.autodraft });
    }
    setDraftForm({
      name: draft.name,
      orderType: draft.orderType,
      pickTimerSeconds: draft.pickTimerSeconds,
      totalRounds: draft.totalRounds,
      scheduledStartTime: toDatetimeLocalValue(draft.scheduledStartTime),
      draftPassword: '',
      teamNames: draft.teams.map((t) => t.name),
    });
  }, [draft, userId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const canJoinRoom = !!draft && now >= new Date(draft.scheduledStartTime).getTime() - ONE_HOUR_MS;

  const handleSaveTeam = async () => {
    if (!idToken || !draftId) return;
    try {
      const { draft: updated } = await updateTeam(idToken, draftId, teamForm);
      setDraft(updated);
    } catch (error) {
      alert(`Error: ${error instanceof ApiError ? error.message : 'Failed to update team'}`);
    }
  };

  const addTeamName = () => {
    setDraftForm((prev) => ({ ...prev, teamNames: [...prev.teamNames, ''] }));
  };

  const removeTeamName = (index: number) => {
    setDraftForm((prev) => ({ ...prev, teamNames: prev.teamNames.filter((_, i) => i !== index) }));
  };

  const updateTeamNameAt = (index: number, value: string) => {
    setDraftForm((prev) => {
      const newTeamNames = [...prev.teamNames];
      newTeamNames[index] = value;
      return { ...prev, teamNames: newTeamNames };
    });
  };

  const handleSaveDraft = async () => {
    if (!idToken || !draftId) return;
    if (!draftForm.name || draftForm.teamNames.some((name) => !name)) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { draft: updated } = await updateDraft(idToken, draftId, {
        name: draftForm.name,
        orderType: draftForm.orderType,
        pickTimerSeconds: draftForm.pickTimerSeconds,
        totalRounds: draftForm.totalRounds,
        scheduledStartTime: new Date(draftForm.scheduledStartTime).toISOString(),
        ...(draftForm.draftPassword ? { draftPassword: draftForm.draftPassword } : {}),
        teamNames: draftForm.teamNames,
      });
      setDraft(updated);
      setDraftForm((prev) => ({ ...prev, draftPassword: '' }));
    } catch (error) {
      alert(`Error: ${error instanceof ApiError ? error.message : 'Failed to update draft'}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!draft) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Failed to load draft</Typography>
        <Button onClick={() => navigate('/')}>Back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
        Back
      </Button>

      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5">{draft.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(draft.scheduledStartTime).toLocaleString()}
                </Typography>
              </Box>
              <Chip label={draft.status} color="primary" variant="outlined" />
            </Stack>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!canJoinRoom}
              onClick={() => navigate(`/draft/${draftId}/room`)}
            >
              {canJoinRoom ? 'Join Draft Room' : 'Join Draft Room (opens 1 hour before start)'}
            </Button>
          </CardContent>
        </Card>

        {myTeam && (
          <Card sx={{ mb: 2, boxShadow: 2 }}>
            <CardHeader title="My Team Settings" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Team Name"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Team Color"
                  type="color"
                  value={teamForm.color}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, color: e.target.value }))}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={teamForm.autodraft}
                      onChange={(e) => setTeamForm((prev) => ({ ...prev, autodraft: e.target.checked }))}
                    />
                  }
                  label="Autodraft"
                />
                <Button variant="contained" onClick={handleSaveTeam}>
                  Save Team Settings
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card sx={{ boxShadow: 2 }}>
            <CardHeader title="Draft Settings" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Draft Name"
                  value={draftForm.name}
                  onChange={(e) => setDraftForm((prev) => ({ ...prev, name: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="Draft Date & Time"
                  type="datetime-local"
                  value={draftForm.scheduledStartTime}
                  onChange={(e) => setDraftForm((prev) => ({ ...prev, scheduledStartTime: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel>Order Type</InputLabel>
                  <Select
                    value={draftForm.orderType}
                    label="Order Type"
                    onChange={(e) => setDraftForm((prev) => ({ ...prev, orderType: e.target.value as OrderType }))}
                  >
                    <MenuItem value="snake">Snake</MenuItem>
                    <MenuItem value="linear">Linear</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Pick Timeout (seconds)"
                  type="number"
                  value={draftForm.pickTimerSeconds}
                  onChange={(e) =>
                    setDraftForm((prev) => ({ ...prev, pickTimerSeconds: parseInt(e.target.value, 10) }))
                  }
                  fullWidth
                />

                <TextField
                  label="Total Rounds"
                  type="number"
                  value={draftForm.totalRounds}
                  onChange={(e) => setDraftForm((prev) => ({ ...prev, totalRounds: parseInt(e.target.value, 10) }))}
                  fullWidth
                />

                <TextField
                  label="New Draft Password"
                  type="password"
                  value={draftForm.draftPassword}
                  onChange={(e) => setDraftForm((prev) => ({ ...prev, draftPassword: e.target.value }))}
                  helperText="Leave blank to keep the current password"
                  fullWidth
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Teams
                  </Typography>
                  <Stack spacing={1}>
                    {draftForm.teamNames.map((name, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label={`Team ${index + 1}`}
                          value={name}
                          onChange={(e) => updateTeamNameAt(index, e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeTeamName(index)}
                          disabled={draftForm.teamNames.length === 1}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    ))}
                    <Button variant="outlined" size="small" startIcon={<Add />} onClick={addTeamName}>
                      Add Team
                    </Button>
                  </Stack>
                </Box>

                <Button variant="contained" onClick={handleSaveDraft}>
                  Save Draft Settings
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default DraftDetail;
