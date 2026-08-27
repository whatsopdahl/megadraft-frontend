import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardHeader, Button, Typography, Stack, FormControlLabel, Switch } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../notifications/NotificationContext';
import { useDraftSocket } from '../ws/useDraftSocket';
import { usePickTimeoutTrigger } from '../ws/usePickTimeoutTrigger';
import { Draft, DraftPick } from '../ws/types';
import { teamIdForPick } from '../ws/draftOrder';
import { updateTeam } from '../api/draftApi';
import { ApiError } from '../api/client';
import DraftOrder from '../components/DraftOrder';
import Roster from '../components/Roster';
import PlayerSearch from '../components/PlayerSearch';
import DraftLog from '../components/DraftLog';
import DraftRoomSkeleton from '../components/DraftRoomSkeleton';
import { ExitToApp } from '@mui/icons-material';

function formatTimeToDraft(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

const DraftRoom: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { idToken } = useAuth();
  const { notify } = useNotification();
  const { send, lastMessage, connectionState } = useDraftSocket(idToken);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeToDraft, setTimeToDraft] = useState(0);
  const [autodraftSaving, setAutodraftSaving] = useState(false);

  // Decode JWT to get user info
  const decodeToken = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  };

  const userInfo = idToken ? decodeToken(idToken) : null;
  const myTeam = draft?.teams.find((t) => t.ownerUserId === userInfo?.sub);
  const userFantasyTeamId = myTeam?.fantasyTeamId;
  const onClockTeamId = draft
    ? teamIdForPick(draft.pickOrderTeamIds, draft.orderType, draft.currentPickNumber)
    : undefined;
  const isCurrentUserTurn = draft && userFantasyTeamId && onClockTeamId === userFantasyTeamId;
  const isCommissioner = draft && userInfo && draft.commissionerUserId === userInfo.sub;

  const myTeamEntries = picks
    .filter((p) => p.fantasyTeamId === userFantasyTeamId)
    .map((p) => ({ position: p.playerPosition, sportLeague: p.sportLeague }));

  // Fetch initial draft state
  useEffect(() => {
    if (!draftId || connectionState !== 'open') {
      return;
    }

    send({ action: 'getDraftState', draftId });
  }, [draftId, connectionState, send]);

  usePickTimeoutTrigger(draft, draftId, connectionState, send);

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    if (lastMessage.type === 'draftState') {
      setDraft(lastMessage.draft);
      setPicks(lastMessage.picks);
      setLoading(false);
    } else if (lastMessage.type === 'pickMade') {
      const team = lastMessage.draft.teams.find((t) => t.fantasyTeamId === lastMessage.pick.fantasyTeamId);
      notify(
        `${team?.name ?? 'A team'} picked ${lastMessage.pick.playerName} (${lastMessage.pick.sportLeague})`,
        'info',
      );
      setDraft(lastMessage.draft);
      setPicks((prev) => [...prev, lastMessage.pick]);
    } else if (lastMessage.type === 'draftStarted') {
      setDraft(lastMessage.draft);
    } else if (lastMessage.type === 'draftUpdated') {
      setDraft(lastMessage.draft);
    } else if (lastMessage.type === 'error') {
      notify(lastMessage.message, 'error');
    }
  }, [lastMessage, notify]);

  // Countdown to the draft's scheduled start, refreshed once a minute
  useEffect(() => {
    if (!draft) {
      return;
    }

    const update = () => {
      setTimeToDraft(new Date(draft.scheduledStartTime).getTime() - Date.now());
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [draft?.scheduledStartTime]);

  const handleDraftPlayer = (playerId: string) => {
    if (!draftId) return;
    send({ action: 'makePick', draftId, playerId });
  };

  const handleStartDraft = () => {
    if (!draftId) return;
    send({ action: 'startDraft', draftId });
  };

  const handleToggleAutodraft = async (autodraft: boolean) => {
    if (!draftId || !idToken) return;
    setAutodraftSaving(true);
    try {
      // The draftUpdated broadcast this triggers is what actually updates
      // `draft` state - no local optimistic update needed.
      await updateTeam(idToken, draftId, { autodraft });
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Failed to update autodraft setting', 'error');
    } finally {
      setAutodraftSaving(false);
    }
  };

  // Completed drafts are shown on the dedicated review page instead of the live room.
  useEffect(() => {
    if (draft?.status === 'complete' && draftId) {
      navigate(`/draft/${draftId}/review`, { replace: true });
    }
  }, [draft?.status, draftId, navigate]);

  if (loading || draft?.status === 'complete') {
    return <DraftRoomSkeleton />;
  }

  if (!draft || !draftId) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Failed to load draft</Typography>
        <Button onClick={() => navigate('/')}>Back</Button>
      </Box>
    );
  }

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={draft.name}
          subheader={draft.status === 'pending' ? timeToDraft > 0 ? `Time to draft: ${formatTimeToDraft(timeToDraft)}` : `Commissioner will start the draft when ready` : undefined}
          action={
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {myTeam && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={myTeam.autodraft}
                      disabled={autodraftSaving}
                      onChange={(e) => handleToggleAutodraft(e.target.checked)}
                    />
                  }
                  label="Autodraft"
                />
              )}
              {draft.status === 'pending' && isCommissioner &&
                <Button variant="contained" color="success" onClick={handleStartDraft} sx={{ m: 1 }}>
                  Start Draft
                </Button>
              }
              <Button startIcon={<ExitToApp />} onClick={() => navigate(-1)}>Leave Draft Room</Button>
            </Stack>
          }
        />
      </Card>
      <Box sx={{ mb: 2 }}>
        <DraftOrder
          teams={draft.teams}
          pickOrderTeamIds={draft.pickOrderTeamIds}
          orderType={draft.orderType}
          currentPickNumber={draft.currentPickNumber}
          totalRounds={draft.totalRounds}
          myFantasyTeamId={userFantasyTeamId}
          currentPickDeadline={draft.currentPickDeadline}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr 1fr' }, gap: 2 }}>
        <Roster
          sportLeagues={draft.sportLeagues}
          rosterConfig={draft.rosterConfig}
          picks={picks}
          fantasyTeamId={userFantasyTeamId}
        />

        <PlayerSearch
          draftId={draftId}
          picks={picks}
          teams={draft.teams}
          sportLeagues={draft.sportLeagues}
          rosterConfig={draft.rosterConfig}
          myTeamEntries={myTeamEntries}
          canDraft={!!isCurrentUserTurn && draft.status === 'active'}
          onDraftPlayer={handleDraftPlayer}
        />

        <DraftLog picks={picks} teams={draft.teams} />
      </Box>
    </>
  );
};

export default DraftRoom;
