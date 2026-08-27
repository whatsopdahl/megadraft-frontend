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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { MoreVert, Delete } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../notifications/NotificationContext';
import { listMyDrafts, deleteDraft } from '../api/draftApi';
import { ApiError } from '../api/client';
import { Draft } from '../ws/types';

const Dashboard: React.FC = () => {
  const { idToken, userId } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuDraftId, setMenuDraftId] = useState<string | null>(null);

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

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuDraftId(null);
  };

  const handleDeleteDraft = async (draft: Draft) => {
    closeMenu();
    if (!idToken) return;
    if (!window.confirm(`Delete "${draft.name}"? This can't be undone.`)) {
      return;
    }

    try {
      await deleteDraft(idToken, draft.draftId);
      setDrafts((prev) => prev.filter((d) => d.draftId !== draft.draftId));
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Failed to delete draft', 'error');
    }
  };

  const menuDraft = drafts.find((d) => d.draftId === menuDraftId) ?? null;

  return (
    <>
      <Card sx={{ boxShadow: 3, maxWidth: 700, mx: 'auto' }}>
        <CardHeader
          title="My Drafts"
          action={
            <Stack direction="row" spacing={2}>
              <Button disabled={loading} variant="contained" onClick={() => navigate('/new')}>
                Create Draft
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
              <Typography variant="h6" sx={{ mb: 1 }}>
                You're not part of any drafts yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Invited to one? It'll show up here as soon as you log in with the email the commissioner used to add you.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {drafts.map((draft) => (
                <Card key={draft.draftId} sx={{ boxShadow: 2, position: 'relative' }}>
                  <CardActionArea onClick={() => navigate(`/draft/${draft.draftId}${draft.status === 'complete' ? '/review' : ''}`)}>
                    <CardContent>
                      <Stack direction="column">
                        <Stack direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Typography sx={{ flexGrow: 1 }} variant="h6">{draft.name}</Typography>
                          <Chip label={draft.status} size="small" color="primary" variant="outlined" />
                          {draft.commissionerUserId === userId && <Box sx={{ width: 40 }} />}
                        </Stack>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(draft.scheduledStartTime).toLocaleString()} · {roleLabel(draft)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                  {draft.commissionerUserId === userId && (
                    <IconButton
                      aria-label="draft options"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAnchorEl(e.currentTarget);
                        setMenuDraftId(draft.draftId);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
      <Menu anchorEl={menuAnchorEl} open={!!menuAnchorEl} onClose={closeMenu}>
        <MenuItem onClick={() => menuDraft && handleDeleteDraft(menuDraft)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          Delete Draft
        </MenuItem>
      </Menu>
    </>
  );
};

export default Dashboard;
