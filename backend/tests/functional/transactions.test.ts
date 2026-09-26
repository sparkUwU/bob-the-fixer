/**
 * Functional Test: Transactions
 * Tests listing and fetching individual transactions.
 * These should ALL PASS regardless of vulnerability state.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, `../../../data/func-transactions-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;

describe('[FUNCTIONAL] Transactions', () => {
  let aliceCookie: string;
  let bobCookie: string;
  let seedTxId: number;

  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch {}
    }
    await initializeDatabase();

    let res = await request(app).post('/api/auth/login').send({ username: 'Alice', password: 'password123' });
    aliceCookie = res.headers['set-cookie'][0].split(';')[0];

    res = await request(app).post('/api/auth/login').send({ username: 'Bob', password: 'password123' });
    bobCookie = res.headers['set-cookie'][0].split(';')[0];

    // Get Alice's first transaction ID from seed data
    const txRes = await request(app).get('/api/transactions').set('Cookie', aliceCookie);
    seedTxId = txRes.body.transactions[0]?.id;
  });

  it('returns the list of transactions for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.transactions).toBeInstanceOf(Array);
    expect(res.body.transactions.length).toBeGreaterThan(0);
  });

  it('returns a specific transaction for a participant', async () => {
    const res = await request(app)
      .get(`/api/transactions/${seedTxId}`)
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.transaction).toBeDefined();
    expect(res.body.transaction.id).toBe(seedTxId);
  });

  it('rejects access to a transaction the user was not part of', async () => {
    // Seed tx 2 is from Bob (ACC-1002) to Charlie (ACC-1003) — Alice was not involved
    const res = await request(app)
      .get('/api/transactions/2')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(403);
  });

  it('returns 404 for a non-existent transaction ID', async () => {
    const res = await request(app)
      .get('/api/transactions/99999')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid transaction ID format', async () => {
    const res = await request(app)
      .get('/api/transactions/not-a-number')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(400);
  });

  it('returns search results for a matching description', async () => {
    const res = await request(app)
      .get('/api/transactions/search?q=Rent')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.transactions).toBeInstanceOf(Array);
  });

  it('rejects listing transactions without authentication', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });
});
