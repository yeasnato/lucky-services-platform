import type { BookingStatus, UserRole } from '@/types/core';

const adminTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['assigned', 'cancelled'],
  accepted: ['assigned', 'cancelled'],
  on_the_way: ['assigned', 'completed', 'cancelled'],
  in_progress: ['assigned', 'completed', 'cancelled'],
  completed: [],
  cancelled: []
};

const technicianTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending: [],
  confirmed: [],
  assigned: ['accepted'],
  accepted: ['on_the_way'],
  on_the_way: ['in_progress', 'completed'],
  in_progress: ['completed'],
  completed: [],
  cancelled: []
};

export function canTransition(from: string, to: string, role: UserRole) {
  const transitions = role === 'technician' ? technicianTransitions : adminTransitions;
  return (transitions[from as BookingStatus] || []).includes(to as BookingStatus);
}

export function getAllowedStatusTransitions(status: string, role: UserRole) {
  const transitions = role === 'technician' ? technicianTransitions : adminTransitions;
  return transitions[status as BookingStatus] || [];
}

export function assertCanTransition(from: string, to: string, role: UserRole) {
  if (!canTransition(from, to, role)) {
    throw new Error(`Invalid status change: ${from.replaceAll('_', ' ')} to ${to.replaceAll('_', ' ')}.`);
  }
}
