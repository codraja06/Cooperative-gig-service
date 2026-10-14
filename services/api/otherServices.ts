// ============================================================
// CoopConnect – Rating, Complaint, Notification & Analytics Services
// ============================================================

import type {
  Rating, SubmitRatingPayload, Complaint, SubmitComplaintPayload,
  AppNotification, AnalyticsSummary, ComplaintStatus,
} from '@/types';
import {
  MOCK_RATINGS, MOCK_COMPLAINTS, MOCK_NOTIFICATIONS,
  MOCK_ANALYTICS, MOCK_BOOKINGS, MOCK_USERS,
} from '@/services/mockData';

function delay(ms = 500): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Rating Service ──────────────────────────────────────────

export const ratingService = {
  async submitRating(payload: SubmitRatingPayload): Promise<Rating> {
    await delay(600);
    const already = MOCK_RATINGS.find((r) => r.bookingId === payload.bookingId);
    if (already) throw new Error('You have already submitted a review for this booking.');
    const newRating: Rating = {
      id: `rat-${Date.now()}`,
      bookingId: payload.bookingId,
      customerId: '',       // filled by context
      workerId: payload.workerId,
      overall: payload.overall,
      workQuality: payload.workQuality,
      punctuality: payload.punctuality,
      behaviour: payload.behaviour,
      professionalism: payload.professionalism,
      review: payload.review,
      createdAt: new Date().toISOString(),
    };
    MOCK_RATINGS.push(newRating);
    return newRating;
  },

  async getRatingForBooking(bookingId: string): Promise<Rating | undefined> {
    await delay(300);
    return MOCK_RATINGS.find((r) => r.bookingId === bookingId);
  },

  async getWorkerRatings(workerId: string): Promise<Rating[]> {
    await delay();
    return MOCK_RATINGS.filter((r) => r.workerId === workerId);
  },
};

// ─── Complaint Service ───────────────────────────────────────

export const complaintService = {
  async submitComplaint(
    customerId: string,
    payload: SubmitComplaintPayload,
  ): Promise<Complaint> {
    await delay(600);
    const booking = MOCK_BOOKINGS.find((b) => b.id === payload.bookingId);
    const customer = MOCK_USERS.find((u) => u.id === customerId);
    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      bookingId: payload.bookingId,
      booking,
      customerId,
      customer,
      category: payload.category,
      description: payload.description,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_COMPLAINTS.push(newComplaint);
    return newComplaint;
  },

  async getCustomerComplaints(customerId: string): Promise<Complaint[]> {
    await delay();
    return MOCK_COMPLAINTS.filter((c) => c.customerId === customerId);
  },

  async getAllComplaints(): Promise<Complaint[]> {
    await delay();
    return [...MOCK_COMPLAINTS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    resolutionNote?: string,
  ): Promise<Complaint> {
    await delay(500);
    const idx = MOCK_COMPLAINTS.findIndex((c) => c.id === complaintId);
    if (idx === -1) throw new Error('Complaint not found.');
    MOCK_COMPLAINTS[idx] = {
      ...MOCK_COMPLAINTS[idx],
      status,
      resolutionNote: resolutionNote ?? MOCK_COMPLAINTS[idx].resolutionNote,
      updatedAt: new Date().toISOString(),
    };
    return MOCK_COMPLAINTS[idx];
  },
};

// ─── Notification Service ────────────────────────────────────

export const notificationService = {
  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    await delay(300);
    return MOCK_NOTIFICATIONS.filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async markAsRead(notificationId: string): Promise<void> {
    await delay(200);
    const n = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
    if (n) n.read = true;
  },

  async markAllAsRead(userId: string): Promise<void> {
    await delay(300);
    MOCK_NOTIFICATIONS.filter((n) => n.userId === userId).forEach((n) => {
      n.read = true;
    });
  },
};

// ─── Analytics Service ───────────────────────────────────────

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    await delay(400);
    return { ...MOCK_ANALYTICS };
  },
};
