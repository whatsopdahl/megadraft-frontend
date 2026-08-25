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
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { listMyDrafts } from '../api/draftApi';
import { Draft } from '../ws/types';

const Dashboard: React.FC = () => {
  const { idToken, userId, logout } = useAuth();
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
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 700, mx: 'auto', mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Fantasy Draft
        </Typography>
        <Button variant="outlined" color="inherit" onClick={logout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : drafts.length === 0 ? (
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                You're not part of any drafts yet
              </Typography>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                <Button variant="contained" size="large" onClick={() => navigate('/new')}>
                  Create Draft
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/join')}>
                  Join Draft
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/new')}>
                Create Draft
              </Button>
              <Button variant="outlined" onClick={() => navigate('/join')}>
                Join Draft
              </Button>
            </Stack>

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
      </Box>
    </Box>
  );
};

export default Dashboard;
