import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, TextField, Button, Stack } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { joinDraft as joinDraftRequest } from '../api/draftApi';
import { ApiError } from '../api/client';
import BackBtn from '../components/BackBtn';

const JoinDraft: React.FC = () => {
  const { idToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    draftId: '',
    draftPassword: '',
    fantasyTeamId: '',
  });

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleJoinDraft = async () => {
    if (!form.draftId || !form.draftPassword || !form.fantasyTeamId) {
      alert('Please fill in all fields');
      return;
    }

    if (!idToken) {
      return;
    }

    try {
      const { draft } = await joinDraftRequest(idToken, form.draftId, {
        draftPassword: form.draftPassword,
        fantasyTeamId: form.fantasyTeamId,
      });
      navigate(`/draft/${draft.draftId}`);
    } catch (error) {
      alert(`Error: ${error instanceof ApiError ? error.message : 'Failed to join draft'}`);
    }
  };

  return (
    <>
      <BackBtn/>

      <Card sx={{ maxWidth: 600, mx: 'auto', boxShadow: 3 }}>
        <CardHeader title="Join a Draft" />
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Draft ID"
              value={form.draftId}
              onChange={(e) => handleFormChange('draftId', e.target.value)}
              fullWidth
            />

            <TextField
              label="Draft Password"
              type="password"
              value={form.draftPassword}
              onChange={(e) => handleFormChange('draftPassword', e.target.value)}
              fullWidth
            />

            <TextField
              label="Fantasy Team ID"
              value={form.fantasyTeamId}
              onChange={(e) => handleFormChange('fantasyTeamId', e.target.value)}
              fullWidth
              helperText="Enter the fantasy team ID to join"
            />

            <Button variant="contained" color="primary" fullWidth onClick={handleJoinDraft}>
              Join Draft
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

export default JoinDraft;
