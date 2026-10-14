// ============================================================
// CoopConnect – Mock Booking & Worker Services
// ============================================================

import type { Booking, CreateBookingPayload, Worker, WorkerMatch, BookingStatus } from '@/types';
import {
  MOCK_BOOKINGS, MOCK_WORKERS, MOCK_SERVICES,
  MOCK_USERS,
} from '@/services/mockData';
import { matchWorkers, applyFairnessAdjustment } from '@/features/matching/matchingService';

function delay(ms = 500): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Booking Service ─────────────────────────────────────────

export const bookingService = {
  async getCustomerBookings(customerId: string): Promise<Booking[]> {
    await delay();
    return MOCK_BOOKINGS.filter((b) => b.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAllBookings(): Promise<Booking[]> {
    await delay();
    return [...MOCK_BOOKINGS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getWorkerBookings(workerId: string): Promise<Booking[]> {
    await delay();
    return MOCK_BOOKINGS.filter((b) => b.workerId === workerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getBookingById(bookingId: string): Promise<Booking | undefined> {
    await delay(200);
    return MOCK_BOOKINGS.find((b) => b.id === bookingId);
  },

  async createBooking(
    customerId: string,
    payload: CreateBookingPayload,
  ): Promise<Booking> {
    await delay(800);
    const service = MOCK_SERVICES.find((s) => s.id === payload.serviceId);
    const customer = MOCK_USERS.find((u) => u.id === customerId);
    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      customerId,
      customer,
      workerId: undefined,
      worker: undefined,
      serviceId: payload.serviceId,
      service,
      description: payload.description,
      location: payload.location,
      latitude: payload.latitude,
      longitude: payload.longitude,
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      emergency: payload.emergency,
      status: 'pending',
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_BOOKINGS.push(newBooking);
    return newBooking;
  },

  async cancelBooking(bookingId: string): Promise<Booking> {
    await delay();
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found.');
    const booking = MOCK_BOOKINGS[idx];
    const cancellable: BookingStatus[] = ['pending', 'worker_assigned', 'accepted'];
    if (!cancellable.includes(booking.status)) {
      throw new Error('This booking cannot be cancelled at its current status.');
    }
    MOCK_BOOKINGS[idx] = {
      ...booking,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    return MOCK_BOOKINGS[idx];
  },

  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
  ): Promise<Booking> {
    await delay();
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found.');

    const VALID_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
      pending: ['worker_assigned', 'cancelled'],
      worker_assigned: ['accepted', 'cancelled'],
      accepted: ['in_progress', 'cancelled'],
      in_progress: ['completed'],
    };

    const current = MOCK_BOOKINGS[idx].status;
    const allowed = VALID_TRANSITIONS[current] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition from ${current} to ${newStatus}.`);
    }

    MOCK_BOOKINGS[idx] = {
      ...MOCK_BOOKINGS[idx],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    return MOCK_BOOKINGS[idx];
  },

  async assignWorker(bookingId: string, workerId: string): Promise<Booking> {
    await delay(600);
    const bIdx = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);
    const worker = MOCK_WORKERS.find((w) => w.id === workerId);
    if (bIdx === -1) throw new Error('Booking not found.');
    if (!worker) throw new Error('Worker not found.');
    MOCK_BOOKINGS[bIdx] = {
      ...MOCK_BOOKINGS[bIdx],
      workerId,
      worker,
      status: 'worker_assigned',
      updatedAt: new Date().toISOString(),
    };
    return MOCK_BOOKINGS[bIdx];
  },
};

// ─── Worker Service ──────────────────────────────────────────

export const workerService = {
  async getAllWorkers(): Promise<Worker[]> {
    await delay();
    return [...MOCK_WORKERS];
  },

  async getWorkerById(workerId: string): Promise<Worker | undefined> {
    await delay(200);
    return MOCK_WORKERS.find((w) => w.id === workerId);
  },

  async getWorkerByUserId(userId: string): Promise<Worker | undefined> {
    await delay(200);
    return MOCK_WORKERS.find((w) => w.userId === userId);
  },

  async toggleAvailability(workerId: string): Promise<Worker> {
    await delay(400);
    const idx = MOCK_WORKERS.findIndex((w) => w.id === workerId);
    if (idx === -1) throw new Error('Worker not found.');
    MOCK_WORKERS[idx] = {
      ...MOCK_WORKERS[idx],
      availability: !MOCK_WORKERS[idx].availability,
    };
    return MOCK_WORKERS[idx];
  },

  async updateVerificationStatus(
    workerId: string,
    status: 'verified' | 'rejected',
    note?: string,
  ): Promise<Worker> {
    await delay();
    const idx = MOCK_WORKERS.findIndex((w) => w.id === workerId);
    if (idx === -1) throw new Error('Worker not found.');
    MOCK_WORKERS[idx] = { ...MOCK_WORKERS[idx], verificationStatus: status };
    return MOCK_WORKERS[idx];
  },

  async matchWorkersForBooking(
    booking: Pick<Booking, 'serviceId' | 'latitude' | 'longitude'>,
  ): Promise<WorkerMatch[]> {
    await delay(700);
    const raw = matchWorkers(booking, MOCK_WORKERS);
    return applyFairnessAdjustment(raw);
  },
};
