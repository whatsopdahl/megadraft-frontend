import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { createDraft as createDraftRequest } from '../api/draftApi';
import { ApiError } from '../api/client';
import { OrderType } from '../ws/types';

const CreateDraft: React.FC = () => {
  const { idToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    orderType: 'snake' as OrderType,
    pickTimerSeconds: 30,
    totalRounds: 10,
    scheduledStartTime: '',
    draftPassword: '',
    teamNames: [''] as string[],
  });

  const handleFormChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTeamName = () => {
    setForm((prev) => ({ ...prev, teamNames: [...prev.teamNames, ''] }));
  };

  const removeTeamName = (index: number) => {
    setForm((prev) => ({ ...prev, teamNames: prev.teamNames.filter((_, i) => i !== index) }));
  };

  const updateTeamName = (index: number, value: string) => {
    setForm((prev) => {
      const newTeamNames = [...prev.teamNames];
      newTeamNames[index] = value;
      return { ...prev, teamNames: newTeamNames };
    });
  };

  const handleCreateDraft = async () => {
    if (
      !form.name ||
      !form.draftPassword ||
      !form.scheduledStartTime ||
      form.teamNames.some((name) => !name)
    ) {
      alert('Please fill in all fields');
      return;
    }

    if (!idToken) {
      return;
    }

    try {
      const { draft } = await createDraftRequest(idToken, {
        name: form.name,
        draftPassword: form.draftPassword,
        orderType: form.orderType,
        pickTimerSeconds: form.pickTimerSeconds,
        totalRounds: form.totalRounds,
        scheduledStartTime: new Date(form.scheduledStartTime).toISOString(),
        teamNames: form.teamNames,
      });
      navigate(`/draft/${draft.draftId}`);
    } catch (error) {
      alert(`Error: ${error instanceof ApiError ? error.message : 'Failed to create draft'}`);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
        <Button onClick={() => navigate('/')}>Back</Button>
      </Box>

      <Card sx={{ maxWidth: 600, mx: 'auto', boxShadow: 3 }}>
        <CardHeader title="Create a Draft" />
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Draft Name"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={form.orderType}
                label="Order Type"
                onChange={(e) => handleFormChange('orderType', e.target.value as OrderType)}
              >
                <MenuItem value="snake">Snake</MenuItem>
                <MenuItem value="linear">Linear</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Pick Timer (seconds)"
              type="number"
              value={form.pickTimerSeconds}
              onChange={(e) => handleFormChange('pickTimerSeconds', parseInt(e.target.value, 10))}
              fullWidth
            />

            <TextField
              label="Total Rounds"
              type="number"
              value={form.totalRounds}
              onChange={(e) => handleFormChange('totalRounds', parseInt(e.target.value, 10))}
              fullWidth
            />

            <TextField
              label="Draft Date & Time"
              type="datetime-local"
              value={form.scheduledStartTime}
              onChange={(e) => handleFormChange('scheduledStartTime', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />

            <TextField
              label="Draft Password"
              type="password"
              value={form.draftPassword}
              onChange={(e) => handleFormChange('draftPassword', e.target.value)}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Team Names
              </Typography>
              <Stack spacing={1}>
                {form.teamNames.map((name, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label={`Team ${index + 1}`}
                      value={name}
                      onChange={(e) => updateTeamName(index, e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeTeamName(index)}
                      disabled={form.teamNames.length === 1}
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

            <Button variant="contained" color="primary" fullWidth onClick={handleCreateDraft}>
              Create Draft
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateDraft;
