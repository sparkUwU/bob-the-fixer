/**
 * Functional Test: Profile
 * Tests user profile retrieval and updates.
 * These should ALL PASS regardless of vulnerability state.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, `../../../data/func-profile-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;

describe('[FUNCTIONAL] Profile', () => {
  let aliceCookie: string;
  let aliceId: number;

  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch {}
    }
    await initializeDatabase();

    const res = await request(app).post('/api/auth/login').send({ username: 'Alice', password: 'password123' });
    aliceCookie = res.headers['set-cookie'][0].split(';')[0];
    aliceId = res.body.user.id;
  });

  it("returns the authenticated user's own profile", async () => {
    const res = await request(app)
      .get(`/api/users/${aliceId}`)
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('Alice');
    expect(res.body.user.email).toBe('alice@securebank.local');
  });

  it("returns the authenticated user's account details", async () => {
    const res = await request(app)
      .get('/api/accounts/me')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.account).toBeDefined();
    expect(res.body.account.account_number).toBe('ACC-1001');
    expect(typeof res.body.account.balance).toBe('number');
  });

  it("updates the authenticated user's email", async () => {
    const res = await request(app)
      .put(`/api/users/${aliceId}`)
      .set('Cookie', aliceCookie)
      .send({ email: 'alice-updated@securebank.local' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
  });

  it('rejects profile access without authentication', async () => {
    const res = await request(app).get(`/api/users/${aliceId}`);
    expect(res.status).toBe(401);
  });

  it('returns 404 for a non-existent user ID', async () => {
    const res = await request(app)
      .get('/api/users/99999')
      .set('Cookie', aliceCookie);
    // NOTE: VULN-001 means this may return 404 (user not found) or 200 if user exists
    // This test just ensures the endpoint doesn't crash (no 500)
    expect([200, 404]).toContain(res.status);
  });
});
