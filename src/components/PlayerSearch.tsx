import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { DraftPick, FantasyTeam, Player, SportLeague } from '../ws/types';
import { RosterConfig, ROSTER_POSITIONS, hasRosterCapacity } from '../rosterConfig';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../notifications/NotificationContext';
import { getPlayers } from '../api/draftApi';
import { ApiError } from '../api/client';
import { teamLogoSrc } from '../teamLogos';

// Shared between the header row and every player row so their columns stay
// aligned - Player is the only column that should grow/shrink with content.
const PLAYER_GRID_COLUMNS = '40px 1fr 72px 56px 108px';

interface PlayerSearchProps {
  draftId: string;
  picks: DraftPick[];
  teams: FantasyTeam[];
  sportLeagues: SportLeague[];
  rosterConfig?: RosterConfig;
  myTeamEntries: { position: string; sportLeague: SportLeague }[];
  canDraft: boolean;
  onDraftPlayer: (playerId: string) => void;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  draftId,
  picks,
  teams,
  sportLeagues,
  rosterConfig,
  myTeamEntries,
  canDraft,
  onDraftPlayer,
}) => {
  const { idToken } = useAuth();
  const { notify } = useNotification();
  const [players, setPlayers] = useState<Player[]>([]);
  const [league, setLeague] = useState<SportLeague | null>(sportLeagues[0] ?? null);
  const [position, setPosition] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(25);

  useEffect(() => {
    if (!draftId || !idToken) {
      return;
    }

    getPlayers(idToken, draftId)
      .then(({ players }) => setPlayers(players))
      .catch((error) => notify(error instanceof ApiError ? error.message : 'Failed to load players', 'error'));
  }, [draftId, idToken, notify]);

  const draftedByPlayerId = useMemo(() => {
    const map = new Map<string, DraftPick>();
    for (const pick of picks) {
      map.set(pick.playerId, pick);
    }
    return map;
  }, [picks]);

  const positionsForLeague = league ? ROSTER_POSITIONS[league] : [];

  const filteredPlayers = useMemo(
    () =>
      players
        .filter((p) => !league || p.sportLeague === league)
        .filter((p) => !position || p.position === position)
        .filter((p) => !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase()))
        .slice()
        .sort((a, b) => {
          // overallRanking of 0 means ESPN has no overall rank for this
          // player - treat it as unranked so it sorts last, not first.
          const aOverall = a.overallRanking === 0 ? Infinity : a.overallRanking;
          const bOverall = b.overallRanking === 0 ? Infinity : b.overallRanking;
          if (aOverall !== bOverall) return aOverall - bOverall;
          return a.ranking - b.ranking;
        }),
    [players, league, position, search],
  );

  useEffect(() => {
    setVisibleCount(25);
  }, [league, position, search]);

  const visiblePlayers = filteredPlayers.slice(0, visibleCount);
  const remaining = filteredPlayers.length - visiblePlayers.length;

  return (
    <Card>
      <CardHeader title="Player Search" />
      <CardContent>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
            <ToggleButtonGroup
              value={league}
              exclusive
              size="small"
              onChange={(_, value) => {
                setLeague(value);
                setPosition(null);
              }}
            >
              {sportLeagues.map((l) => (
                <ToggleButton key={l} value={l} aria-label={l}>
                  <Box
                    component="img"
                    src={`/logos/${l.toLowerCase()}.png`}
                    alt={l}
                    sx={{ height: 20, width: 20, objectFit: 'contain' }}
                  />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField
              size="small"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 160 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
            {positionsForLeague.map((pos) => (
              <Chip
                key={pos}
                label={pos}
                size="small"
                clickable
                color={position === pos ? 'primary' : 'default'}
                variant={position === pos ? 'filled' : 'outlined'}
                onClick={() => setPosition(position === pos ? null : pos)}
              />
            ))}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Box sx={{ display: 'grid', gridTemplateColumns: PLAYER_GRID_COLUMNS, gap: 1.5, alignItems: 'center', px: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Rank
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Player
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Team
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Pos
            </Typography>
            <Box />
          </Box>
          {visiblePlayers.map((player) => {
            const pick = draftedByPlayerId.get(player.playerId);
            const isDrafted = !!pick;
            const draftedByTeam = pick ? teams.find((t) => t.fantasyTeamId === pick.fantasyTeamId) : undefined;
            const canDraftThisPlayer =
              canDraft && !isDrafted && hasRosterCapacity(rosterConfig, myTeamEntries, player);

            return (
              <Box
                key={player.playerId}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: PLAYER_GRID_COLUMNS,
                  gap: 1.5,
                  alignItems: 'center',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  opacity: isDrafted ? 0.45 : 1,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  #{player.overallRanking}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 0 }} noWrap>
                  {player.name}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                  {teamLogoSrc(player.sportLeague, player.realTeam) && (
                    <Box
                      component="img"
                      src={teamLogoSrc(player.sportLeague, player.realTeam)!}
                      alt={player.realTeam}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      sx={{ height: 16, width: 16, objectFit: 'contain', flexShrink: 0 }}
                    />
                  )}
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {player.realTeam}
                  </Typography>
                </Stack>
                <Chip label={player.position} size="small" sx={{ justifySelf: 'start' }} />
                <Box sx={{ textAlign: 'right', justifySelf: 'end' }}>
                  {isDrafted ? (
                    <Typography variant="caption" color="textSecondary" noWrap>
                      {draftedByTeam?.name ?? 'Drafted'}
                    </Typography>
                  ) : (
                    <Button
                      size="small"
                      color="primary"
                      variant='outlined'
                      disabled={!canDraftThisPlayer}
                      onClick={() => onDraftPlayer(player.playerId)}
                      aria-label={`Draft ${player.name}`}
                      endIcon={<Add/>}
                    >
                      Draft
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}
          {filteredPlayers.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
              No players match your search.
            </Typography>
          )}
          {remaining > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setVisibleCount((n) => n + 25)}
              sx={{ alignSelf: 'center', mt: 1 }}
            >
              Load {Math.min(25, remaining)} more ({remaining} remaining)
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PlayerSearch;
