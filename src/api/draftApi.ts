import { apiRequest } from './client';
import { Draft, OrderType } from '../ws/types';
import { RosterConfig } from '../rosterConfig';

export interface CreateDraftRequest {
  name: string;
  draftPassword: string;
  orderType: OrderType;
  pickTimerSeconds: number;
  rosterConfig: RosterConfig;
  scheduledStartTime: string;
  teamNames: string[];
}

export interface UpdateDraftRequest {
  name?: string;
  orderType?: OrderType;
  pickTimerSeconds?: number;
  rosterConfig?: RosterConfig;
  scheduledStartTime?: string;
  draftPassword?: string;
  teamNames?: string[];
}

export interface JoinDraftRequest {
  draftPassword: string;
  fantasyTeamId: string;
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

export function joinDraft(idToken: string, draftId: string, body: JoinDraftRequest): Promise<{ draft: Draft }> {
  return apiRequest(`/drafts/${draftId}/join`, { method: 'POST', idToken, body });
}

export function updateTeam(idToken: string, draftId: string, body: UpdateTeamRequest): Promise<{ draft: Draft }> {
  return apiRequest(`/drafts/${draftId}/team`, { method: 'PATCH', idToken, body });
}

export function deleteDraft(idToken: string, draftId: string): Promise<{ message: string }> {
  return apiRequest(`/drafts/${draftId}`, { method: 'DELETE', idToken });
}
