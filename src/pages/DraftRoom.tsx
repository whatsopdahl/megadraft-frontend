import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../notifications/NotificationContext';
import { useDraftSocket } from '../ws/useDraftSocket';
import { Draft, DraftPick, Player, SportLeague } from '../ws/types';
import { teamIdForPick } from '../ws/draftOrder';
import { ROSTER_POSITIONS, hasRosterCapacity, assignRosterSlots } from '../rosterConfig';
import { getPlayers } from '../api/draftApi';
import { ApiError } from '../api/client';

const LEAGUES = Object.keys(ROSTER_POSITIONS) as SportLeague[];

const DraftRoom: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { idToken } = useAuth();
  const { notify } = useNotification();
  const { send, lastMessage, connectionState } = useDraftSocket(idToken);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('');
  const [showDraftedOnly, setShowDraftedOnly] = useState(false);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Get unique positions and teams for filters
  const positions = Array.from(new Set(players.map((p) => p.position)));
  const teams = Array.from(new Set(players.map((p) => p.realTeam)));

  // Decode JWT to get user info
  const decodeToken = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  };

  const userInfo = idToken ? decodeToken(idToken) : null;
  const userFantasyTeamId = draft?.teams.find((t) => t.ownerUserId === userInfo?.sub)?.fantasyTeamId;
  const onClockTeamId = draft
    ? teamIdForPick(draft.pickOrderTeamIds, draft.orderType, draft.currentPickNumber)
    : undefined;
  const isCurrentUserTurn = draft && userFantasyTeamId && onClockTeamId === userFantasyTeamId;
  const isCommissioner = draft && userInfo && draft.commissionerUserId === userInfo.sub;

  const myTeamEntries = picks
    .filter((p) => p.fantasyTeamId === userFantasyTeamId)
    .map((p) => players.find((pl) => pl.playerId === p.playerId))
    .filter((p): p is Player => !!p)
    .map((p) => ({ position: p.position, sportLeague: p.sportLeague }));

  // Fetch initial draft state
  useEffect(() => {
    if (!draftId || connectionState !== 'open') {
      return;
    }

    send({ action: 'getDraftState', draftId });
  }, [draftId, connectionState, send]);

  // Fetch the player pool over REST - too large to push through a WebSocket frame
  useEffect(() => {
    if (!draftId || !idToken) {
      return;
    }

    getPlayers(idToken, draftId)
      .then(({ players }) => setPlayers(players))
      .catch((error) => notify(error instanceof ApiError ? error.message : 'Failed to load players', 'error'));
  }, [draftId, idToken, notify]);

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

  // Timer logic
  useEffect(() => {
    if (!draft || !draft.currentPickDeadline) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const deadline = new Date(draft.currentPickDeadline!).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [draft?.currentPickDeadline]);

  // Filter players
  useEffect(() => {
    let filtered = players;

    if (positionFilter) {
      filtered = filtered.filter((p) => p.position === positionFilter);
    }

    if (teamFilter) {
      filtered = filtered.filter((p) => p.realTeam === teamFilter);
    }

    const draftedPlayerIds = new Set(picks.map((p) => p.playerId));
    const isDrafted = (playerId: string) => draftedPlayerIds.has(playerId);

    if (showDraftedOnly) {
      filtered = filtered.filter((p) => isDrafted(p.playerId));
    } else {
      filtered = filtered.filter((p) => !isDrafted(p.playerId));
    }

    setFilteredPlayers(filtered);
  }, [players, picks, positionFilter, teamFilter, showDraftedOnly]);

  const handleDraftPlayer = (playerId: string) => {
    if (!draftId) return;
    send({ action: 'makePick', draftId, playerId });
  };

  const handleStartDraft = () => {
    if (!draftId) return;
    send({ action: 'startDraft', draftId });
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

  const draftedPlayerIds = new Set(picks.map((p) => p.playerId));
  const currentTeam = draft.teams.find((t) => t.fantasyTeamId === onClockTeamId);

  return (
    <>
      <Button onClick={() => navigate(`/draft/${draftId}`)} sx={{ mb: 2 }}>
        Back to draft details
      </Button>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 2 }}>
        <Box>
          <Card>
            <CardHeader
              title={draft.name}
              subheader={`Status: ${draft.status}`}
              action={
                <Box>
                  <Chip
                    label={`Round: ${Math.floor(draft.currentPickNumber / draft.pickOrderTeamIds.length) + 1}/${draft.totalRounds}`}
                    color="primary"
                  />
                </Box>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {draft.status === 'pending' && isCommissioner && (
                  <Button variant="contained" color="success" fullWidth onClick={handleStartDraft}>
                    Start Draft
                  </Button>
                )}

                {draft.status !== 'pending' && (
                  <Box>
                    <Typography variant="h6">
                      {currentTeam?.name}'s Turn
                      {timeRemaining > 0 && (
                        <Chip
                          label={`${timeRemaining}s`}
                          color={timeRemaining < 10 ? 'error' : 'primary'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Position</InputLabel>
                      <Select
                        value={positionFilter}
                        label="Position"
                        onChange={(e) => setPositionFilter(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        {positions.map((pos) => (
                          <MenuItem key={pos} value={pos}>
                            {pos}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Team</InputLabel>
                      <Select
                        value={teamFilter}
                        label="Team"
                        onChange={(e) => setTeamFilter(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        {teams.map((team) => (
                          <MenuItem key={team} value={team}>
                            {team}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      variant={showDraftedOnly ? 'contained' : 'outlined'}
                      onClick={() => setShowDraftedOnly(!showDraftedOnly)}
                    >
                      {showDraftedOnly ? 'Show Available' : 'Show Drafted'}
                    </Button>
                  </Stack>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                          <TableCell>Player</TableCell>
                          <TableCell>Position</TableCell>
                          <TableCell>Team</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredPlayers.map((player) => {
                          const isDrafted = draftedPlayerIds.has(player.playerId);
                          const pick = picks.find((p) => p.playerId === player.playerId);
                          const pickedByTeam = pick ? draft.teams.find((t) => t.fantasyTeamId === pick.fantasyTeamId) : null;

                          return (
                            <TableRow key={player.playerId} sx={{ opacity: isDrafted ? 0.6 : 1 }}>
                              <TableCell>{player.name}</TableCell>
                              <TableCell>{player.position}</TableCell>
                              <TableCell>{player.realTeam}</TableCell>
                              <TableCell>
                                {isDrafted ? (
                                  <Chip label={pickedByTeam?.name || 'Unknown'} size="small" />
                                ) : (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={
                                      !isCurrentUserTurn ||
                                      draft.status === 'pending' ||
                                      !hasRosterCapacity(draft.rosterConfig, myTeamEntries, player)
                                    }
                                    onClick={() => handleDraftPlayer(player.playerId)}
                                  >
                                    Draft
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardHeader title="Team Rosters" />
            <CardContent>
              <Stack spacing={2}>
                {draft.teams.map((team) => {
                  const teamPicks = picks
                    .filter((p) => p.fantasyTeamId === team.fantasyTeamId)
                    .slice()
                    .sort((a, b) => a.pickNumber - b.pickNumber)
                    .map((p) => {
                      const player = players.find((pl) => pl.playerId === p.playerId);
                      return player
                        ? { playerId: p.playerId, name: player.name, position: player.position, sportLeague: player.sportLeague }
                        : null;
                    })
                    .filter((p): p is { playerId: string; name: string; position: string; sportLeague: SportLeague } => !!p);

                  const assignments = draft.rosterConfig ? assignRosterSlots(draft.rosterConfig, teamPicks) : null;

                  return (
                    <Box key={team.fantasyTeamId}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {team.name}
                      </Typography>
                      {teamPicks.length === 0 ? (
                        <Typography variant="caption" color="textSecondary">
                          No picks yet
                        </Typography>
                      ) : assignments ? (
                        LEAGUES.map((league) => {
                          const leagueAssignments = assignments.filter((a) => a.league === league);
                          if (leagueAssignments.length === 0) return null;
                          return (
                            <Box key={league} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                                {league}
                              </Typography>
                              <Stack spacing={0.25}>
                                {leagueAssignments.map((a) => {
                                  const player = teamPicks.find((p) => p.playerId === a.playerId);
                                  return (
                                    <Typography key={a.playerId} variant="caption">
                                      {a.slot}: {player?.name}
                                    </Typography>
                                  );
                                })}
                              </Stack>
                            </Box>
                          );
                        })
                      ) : (
                        <Stack spacing={0.5}>
                          {teamPicks.map((pick) => (
                            <Typography key={pick.playerId} variant="caption">
                              • {pick.name} ({pick.position})
                            </Typography>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default DraftRoom;
