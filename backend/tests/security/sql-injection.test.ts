/**
 * Security Test: VULN-002 — SQL Injection on Transaction Search
 *
 * Endpoint: GET /api/transactions/search?q=
 *
 * BEFORE remediation: EXPLOIT REPRODUCED
 *   - The query parameter is interpolated directly into the SQL string.
 *   - Payload: ' OR 1=1 -- bypasses account ID filter and dumps all transactions.
 *
 * AFTER remediation: EXPLOIT BLOCKED
 *   - The query parameter is passed as a bound parameter ($1 / ?).
 *   - The payload is treated as a literal string, matching no descriptions.
 *   - To verify: use db.all(sql, [params]) style in searchTransactions controller.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';

describe('[SECURITY] VULN-002: SQL Injection on Transaction Search', () => {
  let aliceCookie: string[];

  beforeAll(async () => {
    await initializeDatabase();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'password123' });
    expect(loginRes.status).toBe(200);
    aliceCookie = loginRes.headers['set-cookie'];
  });

  it('[BASELINE] Normal search returns only matching results', async () => {
    const res = await request(app)
      .get('/api/transactions/search?q=Rent')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.transactions).toBeInstanceOf(Array);
    expect(res.body.transactions.length).toBeGreaterThan(0);
    expect(res.body.transactions[0].description).toContain('Rent');
  });

  it("[EXPLOIT REPRODUCED] SQLi payload dumps all system transactions outside Alice's account", async () => {
    const payload = "' OR 1=1 --";
    const res = await request(app)
      .get(`/api/transactions/search?q=${encodeURIComponent(payload)}`)
      .set('Cookie', aliceCookie);

    expect(res.status).toBe(200);
    // Vulnerable: Alice can see Charlie's Dinner transaction (Bob→Charlie), she was not a party
    const charlieTx = res.body.transactions.find((tx: any) => tx.description === 'Dinner');
    expect(charlieTx).toBeDefined();

    // After remediation, this assertion should flip:
    // expect(charlieTx).toBeUndefined();
  });
});
