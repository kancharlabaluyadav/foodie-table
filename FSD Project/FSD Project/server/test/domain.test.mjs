import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canTransitionOrder,
  canTransitionReservation,
  reservationRange,
  reservationSlotStarts,
  reservationTimesOverlap,
} from '../dist/domain.js';

test('reservation intervals use Indian Standard Time and the configured duration', () => {
  const { startsAt, endsAt } = reservationRange('2026-11-01', '19:30');
  assert.equal(startsAt.toISOString(), '2026-11-01T14:00:00.000Z');
  assert.equal(endsAt.getTime() - startsAt.getTime(), 90 * 60_000);
});

test('reservation overlap checks detect intersecting periods and allow back-to-back bookings', () => {
  const first = reservationRange('2026-11-01', '19:30');
  const overlap = reservationRange('2026-11-01', '20:45');
  const next = reservationRange('2026-11-01', '21:00');
  const existing = { date: '2026-11-01', time: '19:30', ...first };
  assert.equal(reservationTimesOverlap(existing, overlap.startsAt, overlap.endsAt), true);
  assert.equal(reservationTimesOverlap(existing, next.startsAt, next.endsAt), false);
});

test('table lock slots cover the full reservation interval', () => {
  const { startsAt, endsAt } = reservationRange('2026-11-01', '19:30');
  const slots = reservationSlotStarts(startsAt, endsAt);
  assert.equal(slots.length, 6);
  assert.equal(slots[0].toISOString(), startsAt.toISOString());
  assert.equal(slots.at(-1)?.getTime(), endsAt.getTime() - 15 * 60_000);
});

test('order status transitions reject impossible jumps and terminal updates', () => {
  assert.equal(canTransitionOrder('pending', 'confirmed'), true);
  assert.equal(canTransitionOrder('pending', 'delivered'), false);
  assert.equal(canTransitionOrder('completed', 'pending'), false);
});

test('reservation transitions permit manager decisions and block reopening rejected bookings', () => {
  assert.equal(canTransitionReservation('pending', 'confirmed'), true);
  assert.equal(canTransitionReservation('pending', 'rejected'), true);
  assert.equal(canTransitionReservation('rejected', 'confirmed'), false);
});
