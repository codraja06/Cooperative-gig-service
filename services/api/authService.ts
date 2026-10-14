// ============================================================
// CoopConnect – Mock Authentication Service
// Simulates JWT auth. Replace with real Axios calls when
// EXPO_PUBLIC_API_URL is configured.
// ============================================================

import type {
  User, LoginPayload, RegisterCustomerPayload, RegisterWorkerPayload,
} from '@/types';
import { MOCK_USERS } from '@/services/mockData';

function fakeToken(userId: string): string {
  return `mock.jwt.token.${userId}.${Date.now()}`;
}

function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAuthService = {
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    await delay();
    const found = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === payload.email.toLowerCase(),
    );
    if (!found) throw new Error('No account found with this email address.');
    // In real API: validate hashed password server-side
    if (payload.password.length < 6) throw new Error('Invalid credentials.');
    return { user: found, token: fakeToken(found.id) };
  },

  async registerCustomer(
    payload: RegisterCustomerPayload,
  ): Promise<{ user: User; token: string }> {
    await delay();
    const exists = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    );
    if (exists) throw new Error('An account with this email already exists.');

    const newUser: User = {
      id: `usr-cust-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: 'customer',
      address: payload.address,
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);
    return { user: newUser, token: fakeToken(newUser.id) };
  },

  async registerWorker(
    payload: RegisterWorkerPayload,
  ): Promise<{ user: User; token: string }> {
    await delay();
    const exists = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    );
    if (exists) throw new Error('An account with this email already exists.');

    const newUser: User = {
      id: `usr-wkr-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: 'worker',
      address: payload.serviceLocation,
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);
    return { user: newUser, token: fakeToken(newUser.id) };
  },

  async forgotPassword(email: string): Promise<void> {
    await delay(800);
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with this email address.');
    // In real implementation: send email via backend
  },
};
