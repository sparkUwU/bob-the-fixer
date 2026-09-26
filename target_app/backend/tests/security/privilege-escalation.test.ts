/**
 * Security Test: VULN-005 — Broken Admin Authorization / Privilege Escalation
 *
 * Endpoint: GET /api/admin/users, GET /api/admin/transactions
 *
 * BEFORE remediation: EXPLOIT REPRODUCED
 *   - The requireAdmin middleware trusts a client-supplied header: X-Admin-Override: true
 *   - Any authenticated user with this header bypasses the role check.
 *
 * AFTER remediation: EXPLOIT BLOCKED
 *   - The X-Admin-Override header check is removed.
 *   - Authorization is based solely on req.user.role (server-derived, session-bound).
 *   - To verify: remove the overrideHeader block from backend/src/controllers/admin.ts.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';

describe('[SECURITY] VULN-005: Broken Admin Authorization / Privilege Escalation', () => {
  let aliceCookie: string[];
  let adminCookie: string[];

  beforeAll(async () => {
    await initializeDatabase();

    const aliceRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'password123' });
    expect(aliceRes.status).toBe(200);
    aliceCookie = aliceRes.headers['set-cookie'];

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Admin', password: 'admin123' });
    expect(adminRes.status).toBe(200);
    adminCookie = adminRes.headers['set-cookie'];
  });

  it('[BASELINE] Alice is correctly blocked from admin endpoints without the exploit header', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Admin access required');
  });

  it('[EXPLOIT REPRODUCED] Alice escalates to admin via X-Admin-Override header on /admin/users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', aliceCookie)
      .set('X-Admin-Override', 'true');

    // Vulnerable: 200 returned despite Alice being role: USER
    expect(res.status).toBe(200);
    const usernames = res.body.users.map((u: any) => u.username);
    expect(usernames).toContain('Admin');
    expect(usernames).toContain('Bob');
    expect(usernames).toContain('Charlie');

    // After remediation:
    // expect(res.status).toBe(403);
  });

  it('[EXPLOIT REPRODUCED] Alice dumps all system transactions via privilege escalation', async () => {
    const res = await request(app)
      .get('/api/admin/transactions')
      .set('Cookie', aliceCookie)
      .set('X-Admin-Override', 'true');

    expect(res.status).toBe(200);
    expect(res.body.transactions.length).toBeGreaterThan(0);

    // After remediation:
    // expect(res.status).toBe(403);
  });

  it('[BASELINE] Admin account accesses admin endpoints normally (no special headers needed)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
  });
});
