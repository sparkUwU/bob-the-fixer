/**
 * Functional Test: Transfers
 * Tests the core money transfer flow.
 * These should ALL PASS regardless of vulnerability state.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, `../../../data/func-transfers-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;

describe('[FUNCTIONAL] Transfers', () => {
  let aliceCookie: string;
  let bobCookie: string;

  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch {}
    }
    await initializeDatabase();

    let res = await request(app).post('/api/auth/login').send({ username: 'Alice', password: 'password123' });
    aliceCookie = res.headers['set-cookie'][0].split(';')[0];

    res = await request(app).post('/api/auth/login').send({ username: 'Bob', password: 'password123' });
    bobCookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('transfers funds successfully between two accounts', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Cookie', aliceCookie)
      .send({ to_account_number: 'ACC-1002', amount: 100, description: 'Functional test payment' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Transfer successful');
  });

  it('creates a transaction record after a successful transfer', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    const tx = res.body.transactions.find((t: any) => t.description === 'Functional test payment');
    expect(tx).toBeDefined();
    expect(tx.amount).toBe(100);
  });

  it('rejects a transfer with insufficient funds', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Cookie', aliceCookie)
      .send({ to_account_number: 'ACC-1002', amount: 9_999_999 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Insufficient funds');
  });

  it('rejects a transfer to a non-existent account', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Cookie', aliceCookie)
      .send({ to_account_number: 'ACC-9999', amount: 10 });
    expect(res.status).toBe(404);
  });

  it('rejects a transfer to the same account', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Cookie', aliceCookie)
      .send({ to_account_number: 'ACC-1001', amount: 10 });
    expect(res.status).toBe(400);
  });

  it('rejects a transfer without authentication', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .send({ to_account_number: 'ACC-1002', amount: 10 });
    expect(res.status).toBe(401);
  });
});
