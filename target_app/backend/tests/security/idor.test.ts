/**
 * Security Test: VULN-001 — BOLA / IDOR on User Profile
 *
 * Endpoint: GET /api/users/:id
 *
 * BEFORE remediation: EXPLOIT REPRODUCED
 *   - Any authenticated user can supply any user ID and receive that user's private data.
 *
 * AFTER remediation: EXPLOIT BLOCKED
 *   - The server returns 403 Forbidden unless req.user.id === requested ID (or ADMIN).
 *   - To verify: re-enable the authorization check in backend/src/controllers/user.ts
 *     and confirm the "EXPLOIT REPRODUCED" test returns 403 instead of 200.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';

describe('[SECURITY] VULN-001: BOLA / IDOR on User Profile', () => {
  let aliceCookie: string[];
  let bobId: number;

  beforeAll(async () => {
    await initializeDatabase();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'password123' });
    expect(loginRes.status).toBe(200);
    aliceCookie = loginRes.headers['set-cookie'];

    const bobLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Bob', password: 'password123' });
    bobId = bobLogin.body.user.id;
  });

  it('[EXPLOIT REPRODUCED] Alice reads Bob\'s private profile without authorization', async () => {
    const res = await request(app)
      .get(`/api/users/${bobId}`)
      .set('Cookie', aliceCookie);

    // Vulnerable: returns 200 with Bob's private data
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('Bob');
    expect(res.body.user.email).toBe('bob@securebank.local');

    // After remediation, this test should return 403:
    // expect(res.status).toBe(403);
  });

  it('[BASELINE] Alice can still read her own profile', async () => {
    const meRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'password123' });
    const aliceId = meRes.body.user.id;

    const res = await request(app)
      .get(`/api/users/${aliceId}`)
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('Alice');
  });
});
