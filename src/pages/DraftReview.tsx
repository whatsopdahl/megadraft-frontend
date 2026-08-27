import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardHeader, Button, Typography } from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { getDraft, getDraftPicks } from '../api/draftApi';
import { Draft, DraftPick } from '../ws/types';
import DraftLog from '../components/DraftLog';
import TeamRosters from '../components/TeamRosters';
import DraftRoomSkeleton from '../components/DraftRoomSkeleton';

const DraftReview: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { idToken } = useAuth();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idToken || !draftId) return;

    Promise.all([getDraft(idToken, draftId), getDraftPicks(idToken, draftId)])
      .then(([{ draft }, { picks }]) => {
        setDraft(draft);
        setPicks(picks);
      })
      .catch(() => setDraft(null))
      .finally(() => setLoading(false));
  }, [idToken, draftId]);

  // This page is only for completed drafts; send anything else back to the live room.
  useEffect(() => {
    if (draft && draftId && draft.status !== 'complete') {
      navigate(`/draft/${draftId}/room`, { replace: true });
    }
  }, [draft, draftId, navigate]);

  if (loading) {
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
          subheader="Draft Completed"
          action={
            <Button startIcon={<ExitToApp />} onClick={() => navigate(`/`)}>
              Back to Drafts
            </Button>
          }
        />
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
        <TeamRosters
          teams={draft.teams}
          picks={picks}
          sportLeagues={draft.sportLeagues}
          rosterConfig={draft.rosterConfig}
        />
        <DraftLog picks={picks} teams={draft.teams} />
      </Box>
    </>
  );
};

export default DraftReview;
