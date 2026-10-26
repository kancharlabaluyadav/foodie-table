export type OrderStatus = 'awaiting_payment' | 'pending' | 'confirmed' | 'rejected' | 'preparing' | 'ready' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';
export type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'seated' | 'completed' | 'cancelled';

export const RESERVATION_DURATION_MINUTES = 90;
export const RESERVATION_SLOT_MINUTES = 15;

const orderTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  awaiting_payment: ['pending', 'cancelled'], pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'],
  rejected: [], preparing: ['ready', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'],
  ready: ['picked_up', 'out_for_delivery', 'delivered', 'cancelled'], picked_up: ['out_for_delivery', 'delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'], delivered: ['completed'], completed: [], cancelled: [],
};

const reservationTransitions: Record<ReservationStatus, readonly ReservationStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'], confirmed: ['seated', 'cancelled'],
  seated: ['completed'], rejected: [], completed: [], cancelled: [],
};

export function canTransitionOrder(from: string, to: string): boolean {
  return (orderTransitions[from as OrderStatus] || []).includes(to as OrderStatus);
}

export function canTransitionReservation(from: string, to: string): boolean {
  return (reservationTransitions[from as ReservationStatus] || []).includes(to as ReservationStatus);
}

export function reservationRange(date: string, time: string): { startsAt: Date; endsAt: Date } {
  const startsAt = new Date(`${date}T${time}:00+05:30`);
  return { startsAt, endsAt: new Date(startsAt.getTime() + RESERVATION_DURATION_MINUTES * 60_000) };
}

export function reservationSlotStarts(startsAt: Date, endsAt: Date): Date[] {
  const interval = RESERVATION_SLOT_MINUTES * 60_000;
  const first = Math.floor(startsAt.getTime() / interval) * interval;
  const slots: Date[] = [];
  for (let instant = first; instant < endsAt.getTime(); instant += interval) slots.push(new Date(instant));
  return slots;
}

export function reservationTimesOverlap(
  existing: { date: string; time: string; startsAt?: Date | null; endsAt?: Date | null },
  startsAt: Date,
  endsAt: Date,
): boolean {
  const existingRange = existing.startsAt && existing.endsAt
    ? { startsAt: new Date(existing.startsAt), endsAt: new Date(existing.endsAt) }
    : reservationRange(existing.date, existing.time);
  return existingRange.startsAt < endsAt && existingRange.endsAt > startsAt;
}
