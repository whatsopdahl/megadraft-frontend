import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../notifications/NotificationContext';
import { getDraft, updateDraft, updateTeam } from '../api/draftApi';
import { ApiError } from '../api/client';
import { Draft, OrderType } from '../ws/types';
import { DEFAULT_ROSTER_CONFIG, computeTotalRounds } from '../rosterConfig';
import BackBtn from '../components/BackBtn';
import DraftSettingsForm, { DraftSettingsFormValues } from '../components/DraftSettingsForm';

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
  const { notify } = useNotification();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [savingSettings, setSavingSettings] = useState(false);

  const [teamForm, setTeamForm] = useState({ name: '', color: '#1e88e5', autodraft: false });
  const [draftForm, setDraftForm] = useState<DraftSettingsFormValues>({
    name: '',
    orderType: 'snake' as OrderType,
    pickTimerSeconds: 30,
    rosterConfig: DEFAULT_ROSTER_CONFIG,
    scheduledStartTime: '',
    draftPassword: '',
    teamNames: [''],
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
      setTeamForm({
        name: owned.name ?? '',
        color: owned.color ?? '#1e88e5',
        autodraft: owned.autodraft ?? false,
      });
    }
    setDraftForm({
      name: draft.name ?? '',
      orderType: draft.orderType ?? 'snake',
      // the API response isn't runtime-validated against the Draft type, so a
      // missing field here would otherwise flip these TextFields to/from
      // undefined and trigger React's controlled/uncontrolled input warning
      pickTimerSeconds: draft.pickTimerSeconds ?? 30,
      rosterConfig: draft.rosterConfig ?? DEFAULT_ROSTER_CONFIG,
      scheduledStartTime: draft.scheduledStartTime ? toDatetimeLocalValue(draft.scheduledStartTime) : '',
      draftPassword: '',
      teamNames: draft.teams.length > 0 ? draft.teams.map((t) => t.name ?? '') : [''],
    });
  }, [draft, userId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const canJoinRoom = !!draft && now >= new Date(draft.scheduledStartTime).getTime() - ONE_HOUR_MS;

  const handleSaveTeam = async () => {
    if (!idToken || !draftId) return;
    setSavingSettings(true)
    try {
      const { draft: updated } = await updateTeam(idToken, draftId, teamForm);
      setDraft(updated);
      notify("Team settings updated", 'success')
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Failed to update team', 'error');
    } finally {
      setSavingSettings(false)
    }
  };

  const handleSaveDraft = async () => {
    if (!idToken || !draftId) return;
    if (!draftForm.name || draftForm.teamNames.some((name) => !name)) {
      notify('Please fill in all fields', 'warning');
      return;
    }
    if (computeTotalRounds(draftForm.rosterConfig) === 0) {
      notify('Roster configuration must include at least one slot', 'warning');
      return;
    }
    setSavingSettings(true)
    try {
      const { draft: updated } = await updateDraft(idToken, draftId, {
        name: draftForm.name,
        orderType: draftForm.orderType,
        pickTimerSeconds: draftForm.pickTimerSeconds,
        rosterConfig: draftForm.rosterConfig,
        scheduledStartTime: new Date(draftForm.scheduledStartTime).toISOString(),
        ...(draftForm.draftPassword ? { draftPassword: draftForm.draftPassword } : {}),
        teamNames: draftForm.teamNames,
      });
      setDraft(updated);
      setDraftForm((prev) => ({ ...prev, draftPassword: '' }));
      notify("Draft settings updated", 'success')
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Failed to update draft', 'error');
    } finally {
      setSavingSettings(false)
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardHeader
            title={<Skeleton animation='wave' width={250} />}
            subheader={<Skeleton animation='wave' width={300}/>}
          />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress/>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!draft) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardHeader
            title="Uh oh!"
            subheader="Error loading draft"
          />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button onClick={()=> navigate(-1)}>Go Back</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <BackBtn/>
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardHeader
            title={draft.name}
            subheader={draft.scheduledStartTime}
            action={
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={!canJoinRoom}
                onClick={() => navigate(`/draft/${draftId}/room`)}
              >
                {canJoinRoom ? 'Join Draft Room' : 'Join Draft Room (opens 1 hour before start)'}
              </Button>
            }
          />
          <CardContent>
            {myTeam && (
              <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">My Team Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="Team Name"
                        value={teamForm.name}
                        sx={{ flexGrow: 2 }}
                        onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                        disabled={savingSettings}
                      />
                      <TextField
                        label="Team Color"
                        type="color"
                        sx={{ flexGrow: 1 }}
                        value={teamForm.color}
                        onChange={(e) => setTeamForm((prev) => ({ ...prev, color: e.target.value }))}
                        disabled={savingSettings}
                      />
                    </Stack>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={teamForm.autodraft}
                          onChange={(e) => setTeamForm((prev) => ({ ...prev, autodraft: e.target.checked }))}
                          disabled={savingSettings}
                        />
                      }
                      label="Autodraft"
                    />
                    <Button loading={savingSettings} variant="contained" onClick={handleSaveTeam}>
                      Save Team Settings
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {isAdmin && (
              <Accordion defaultExpanded sx={{ boxShadow: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Draft Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <DraftSettingsForm
                      form={draftForm}
                      onChange={setDraftForm}
                      passwordLabel="New Draft Password"
                      passwordHelperText="Leave blank to keep the current password"
                    />
                    <Button loading={savingSettings} variant="contained" onClick={handleSaveDraft}>
                      Save Draft Settings
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default DraftDetail;
