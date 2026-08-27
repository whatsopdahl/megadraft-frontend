import { apiRequest } from './client';
import { Draft, DraftPick, OrderType, Player } from '../ws/types';
import { RosterConfig } from '../rosterConfig';

export interface TeamInput {
  name: string;
  email: string;
}

export interface CreateDraftRequest {
  name: string;
  orderType: OrderType;
  pickTimerSeconds: number;
  rosterConfig: RosterConfig;
  scheduledStartTime: string;
  teams: TeamInput[];
}

export interface UpdateDraftRequest {
  name?: string;
  orderType?: OrderType;
  pickTimerSeconds?: number;
  rosterConfig?: RosterConfig;
  scheduledStartTime?: string;
  teams?: TeamInput[];
}

export interface UpdateTeamRequest {
  name?: string;
  color?: string;
  autodraft?: boolean;
}

export function listMyDrafts(idToken: string): Promise<{ drafts: Draft[] }> {
  return apiRequest('/drafts', { method: 'GET', idToken });
}

export function createDraft(idToken: string, body: CreateDraftRequest): Promise<{ draft: Draft }> {
  return apiRequest('/drafts', { method: 'POST', idToken, body });
}

export function getDraft(idToken: string, draftId: string): Promise<{ draft: Draft }> {
  return apiRequest(`/drafts/${draftId}`, { method: 'GET', idToken });
}

export function updateDraft(idToken: string, draftId: string, body: UpdateDraftRequest): Promise<{ draft: Draft }> {
  return apiRequest(`/drafts/${draftId}`, { method: 'PATCH', idToken, body });
}

export function updateTeam(idToken: string, draftId: string, body: UpdateTeamRequest): Promise<{ draft: Draft }> {
  return apiRequest(`/drafts/${draftId}/team`, { method: 'PATCH', idToken, body });
}

export function deleteDraft(idToken: string, draftId: string): Promise<{ message: string }> {
  return apiRequest(`/drafts/${draftId}`, { method: 'DELETE', idToken });
}

export function getPlayers(idToken: string, draftId: string): Promise<{ players: Player[] }> {
  return apiRequest(`/drafts/${draftId}/players`, { method: 'GET', idToken });
}

export function getDraftPicks(idToken: string, draftId: string): Promise<{ picks: DraftPick[] }> {
  return apiRequest(`/drafts/${draftId}/picks`, { method: 'GET', idToken });
}
