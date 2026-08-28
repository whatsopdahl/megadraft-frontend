import type { RosterConfig } from "../rosterConfig";

export type SportLeague = "NBA" | "NFL";
export type OrderType = "snake" | "linear";
export type DraftStatus = "pending" | "active" | "paused" | "complete";

export interface FantasyTeam {
  fantasyTeamId: string;
  name: string;
  // The commissioner-invited email that auto-claims this team on login.
  email: string;
  ownerUserId: string | null;
  color: string;
  autodraft: boolean;
}

export interface Draft {
  draftId: string;
  name: string;
  sportLeagues: SportLeague[];
  orderType: OrderType;
  pickTimerSeconds: number;
  totalRounds: number;
  // drafts created before this field existed won't have one - treated as
  // "no roster-slot enforcement" everywhere it's read
  rosterConfig?: RosterConfig;
  scheduledStartTime: string;
  status: DraftStatus;
  teams: FantasyTeam[];
  pickOrderTeamIds: string[];
  currentPickNumber: number;
  currentPickDeadline: string | null;
  // Only present while status is "paused" - the current pick's remaining
  // time, captured at pause so resuming picks up where the timer left off.
  pausedRemainingMs?: number;
  draftedPlayerIds: string[];
  commissionerUserId: string;
  createdAt: string;
}

// Mirrors lambda/src/lib/types.ts's Player exactly.
export interface Player {
  sportLeague: SportLeague;
  playerId: string;
  name: string;
  realTeam: string;
  position: string;
  /** All real (non-bench/IR/flex) positions this player is eligible at. */
  positions: string[];
  /** ESPN's positional ranking (e.g. RB12). */
  ranking: number;
  /** ESPN's overall ranking across all players in the sport, position-agnostic. */
  overallRanking: number;
  /** ESPN injury status, e.g. "ACTIVE", "QUESTIONABLE", "OUT", "INJURY_RESERVE". */
  injuryStatus: string;
  /** Only present when ESPN reports one (typically while injured). */
  estimatedReturnDate?: string;
}

export interface DraftPick {
  draftId: string;
  pickNumber: number;
  playerId: string;
  playerName: string;
  playerPosition: string;
  sportLeague: SportLeague;
  fantasyTeamId: string;
  pickedByUserId: string | null;
  pickedAt: string;
  auto: boolean;
}

// createDraft/updateDraft live on the REST API (see src/api/draftApi.ts) -
// the WebSocket API is draft-room-only.
export type OutboundClientMessage =
  | { action: "startDraft"; draftId: string }
  | { action: "pauseDraft"; draftId: string }
  | { action: "resumeDraft"; draftId: string }
  | { action: "makePick"; draftId: string; playerId: string }
  | { action: "getDraftState"; draftId: string }
  // Sent the instant a client's local countdown reaches the pick deadline,
  // so autodraft doesn't have to wait on EventBridge Scheduler jitter.
  | { action: "checkPickTimeout"; draftId: string; pickNumber: number };

export type InboundServerMessage =
  | { type: "draftState"; draft: Draft; picks: DraftPick[] }
  | { type: "pickMade"; pick: DraftPick; draft: Draft }
  | { type: "draftStarted"; draft: Draft }
  | { type: "draftPaused"; draft: Draft }
  | { type: "draftResumed"; draft: Draft }
  | { type: "draftUpdated"; draft: Draft }
  | { type: "error"; message: string };
