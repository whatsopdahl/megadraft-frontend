import { OrderType } from './types';

/**
 * Mirrors fantasy-draft-lambdas/src/lib/draftOrder.ts exactly - must stay in
 * sync with the server's pick-order calculation, or the UI will highlight
 * the wrong team's turn (snake drafts reverse direction every other round).
 */
export function teamIdForPick(pickOrderTeamIds: string[], orderType: OrderType, pickNumber: number): string {
  const teamCount = pickOrderTeamIds.length;
  const zeroIndexedPick = pickNumber - 1;
  const round = Math.floor(zeroIndexedPick / teamCount);
  const slotInRound = zeroIndexedPick % teamCount;

  const reversed = orderType === 'snake' && round % 2 === 1;
  const index = reversed ? teamCount - 1 - slotInRound : slotInRound;

  return pickOrderTeamIds[index];
}
