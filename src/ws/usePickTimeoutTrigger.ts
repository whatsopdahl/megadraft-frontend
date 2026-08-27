import { useEffect } from 'react';
import { Draft, OutboundClientMessage } from './types';

// Small buffer past the deadline so we don't race slightly ahead of the
// server's own clock on borderline clock skew - the server re-validates the
// deadline regardless, this just avoids a guaranteed-wasted round trip.
const FIRE_BUFFER_MS = 250;

/**
 * Fires `checkPickTimeout` once this client's local clock passes the draft's
 * currentPickDeadline, so autodraft doesn't have to wait on EventBridge
 * Scheduler jitter (which can be tens of seconds). Every connected client in
 * the room runs this - not just the on-the-clock user - so one
 * disconnected/backgrounded drafter's client doesn't reintroduce the delay.
 * The server re-validates the deadline itself and no-ops safely on
 * races/duplicates from multiple clients firing at once.
 */
export function usePickTimeoutTrigger(
  draft: Draft | null,
  draftId: string | undefined,
  connectionState: 'connecting' | 'open' | 'closed',
  send: (msg: OutboundClientMessage) => void,
): void {
  useEffect(() => {
    if (!draft || !draftId || draft.status !== 'active' || !draft.currentPickDeadline || connectionState !== 'open') {
      return;
    }

    const msRemaining = new Date(draft.currentPickDeadline).getTime() - Date.now();
    const pickNumber = draft.currentPickNumber;

    const timer = setTimeout(() => {
      send({ action: 'checkPickTimeout', draftId, pickNumber });
    }, Math.max(0, msRemaining + FIRE_BUFFER_MS));

    return () => clearTimeout(timer);
  }, [draft?.currentPickDeadline, draft?.status, draft?.currentPickNumber, draftId, connectionState, send]);
}
