import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, Button, Stack } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../notifications/NotificationContext';
import { createDraft as createDraftRequest } from '../api/draftApi';
import { ApiError } from '../api/client';
import { OrderType } from '../ws/types';
import { DEFAULT_ROSTER_CONFIG, computeTotalRounds } from '../rosterConfig';
import BackBtn from '../components/BackBtn';
import DraftSettingsForm, { DraftSettingsFormValues } from '../components/DraftSettingsForm';

const CreateDraft: React.FC = () => {
  const { idToken } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [form, setForm] = useState<DraftSettingsFormValues>({
    name: '',
    orderType: 'snake' as OrderType,
    pickTimerSeconds: 30,
    rosterConfig: DEFAULT_ROSTER_CONFIG,
    scheduledStartTime: '',
    draftPassword: '',
    teamNames: [''],
  });

  const handleCreateDraft = async () => {
    if (
      !form.name ||
      !form.draftPassword ||
      !form.scheduledStartTime ||
      form.teamNames.some((name) => !name)
    ) {
      notify('Please fill in all fields', 'warning');
      return;
    }

    if (computeTotalRounds(form.rosterConfig) === 0) {
      notify('Roster configuration must include at least one slot', 'warning');
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
        rosterConfig: form.rosterConfig,
        scheduledStartTime: new Date(form.scheduledStartTime).toISOString(),
        teamNames: form.teamNames,
      });
      navigate(`/draft/${draft.draftId}`);
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Failed to create draft', 'error');
    }
  };

  return (
    <>
      <BackBtn />

      <Card sx={{ maxWidth: 600, mx: 'auto', boxShadow: 3 }}>
        <CardHeader title="Create a Draft" />
        <CardContent>
          <Stack spacing={2}>
            <DraftSettingsForm form={form} onChange={setForm} passwordLabel="Draft Password" />

            <Button variant="contained" color="primary" fullWidth onClick={handleCreateDraft}>
              Create Draft
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

export default CreateDraft;
