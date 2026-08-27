import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  CardHeader,
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { listMyDrafts } from '../api/draftApi';
import { Draft } from '../ws/types';

const Dashboard: React.FC = () => {
  const { idToken, userId } = useAuth();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idToken) return;

    listMyDrafts(idToken)
      .then(({ drafts }) => setDrafts(drafts))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, [idToken]);

  const roleLabel = (draft: Draft): string => {
    if (draft.commissionerUserId === userId) {
      return 'Commissioner';
    }
    const myTeam = draft.teams.find((t) => t.ownerUserId === userId);
    return myTeam ? myTeam.name : 'Member';
  };

  return (
      <Card sx={{ boxShadow: 3, maxWidth: 700, mx: 'auto'}}>
        <CardHeader
          title="My Drafts"
          action={
            <Stack direction="row" spacing={2}>
              <Button disabled={loading} variant="contained" onClick={() => navigate('/new')}>
                Create Draft
              </Button>
              <Button disabled={loading} variant="contained" onClick={() => navigate('/join')}>
                Join Draft
              </Button>
            </Stack>
          }
        />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : drafts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                You're not part of any drafts yet
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {drafts.map((draft) => (
                <Card key={draft.draftId} sx={{ boxShadow: 2 }}>
                  <CardActionArea onClick={() => navigate(`/draft/${draft.draftId}`)}>
                    <CardContent>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6">{draft.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(draft.scheduledStartTime).toLocaleString()} · {roleLabel(draft)}
                          </Typography>
                        </Box>
                        <Chip label={draft.status} color="primary" variant="outlined" />
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
  );
};

export default Dashboard;
