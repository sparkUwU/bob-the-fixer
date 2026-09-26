import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { initializeDatabase } from '../src/config/database';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, `../../data/api-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;

describe('Core Banking Functionality', () => {
  let aliceCookie: string;
  let bobCookie: string;
  let adminCookie: string;
  let aliceId: number;

  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch (e) {}
    }
    await initializeDatabase();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Login Alice
    let res = await request(app).post('/api/auth/login').send({ username: 'Alice', password: 'password123' });
    aliceCookie = res.headers['set-cookie'][0].split(';')[0];
    aliceId = res.body.user.id;

    // Login Bob
    res = await request(app).post('/api/auth/login').send({ username: 'Bob', password: 'password123' });
    bobCookie = res.headers['set-cookie'][0].split(';')[0];

    // Login Admin
    res = await request(app).post('/api/auth/login').send({ username: 'Admin', password: 'admin123' });
    adminCookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('should get transactions for logged-in user', async () => {
    const res = await request(app).get('/api/transactions').set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.transactions).toBeInstanceOf(Array);
    expect(res.body.transactions.length).toBeGreaterThan(0);
  });

  it('should transfer funds successfully and update balances', async () => {
    // Bob transfers $50 to Alice (Alice's account is ACC-1001)
    const transferRes = await request(app)
      .post('/api/transfers')
      .set('Cookie', bobCookie)
      .send({ to_account_number: 'ACC-1001', amount: 50, description: 'Test Transfer' });
    
    expect(transferRes.status).toBe(200);
    expect(transferRes.body.message).toBe('Transfer successful');

    // Check Bob's transactions
    const bobTxRes = await request(app).get('/api/transactions').set('Cookie', bobCookie);
    const newTx = bobTxRes.body.transactions.find((tx: any) => tx.description === 'Test Transfer');
    expect(newTx).toBeDefined();
    expect(newTx.amount).toBe(50);
  });

  it('should fail transfer with insufficient funds', async () => {
    const transferRes = await request(app)
      .post('/api/transfers')
      .set('Cookie', bobCookie)
      .send({ to_account_number: 'ACC-1001', amount: 1000000 });
    
    expect(transferRes.status).toBe(400);
    expect(transferRes.body.error).toBe('Insufficient funds');
  });

  it('should fetch user profile if authorized', async () => {
    const res = await request(app).get(`/api/users/${aliceId}`).set('Cookie', aliceCookie);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('Alice');
  });

  it.skip('should deny profile access to unauthorized users (VULN-001 IDOR introduced)', async () => {
    // Bob tries to access Alice's profile
    const res = await request(app).get(`/api/users/${aliceId}`).set('Cookie', bobCookie);
    expect(res.status).toBe(403);
  });

  it('admin should be able to access all users and transactions', async () => {
    const usersRes = await request(app).get('/api/admin/users').set('Cookie', adminCookie);
    expect(usersRes.status).toBe(200);
    expect(usersRes.body.users.length).toBeGreaterThan(0);

    const txRes = await request(app).get('/api/admin/transactions').set('Cookie', adminCookie);
    expect(txRes.status).toBe(200);
    expect(txRes.body.transactions.length).toBeGreaterThan(0);
  });

  it('normal user should be denied admin access', async () => {
    const usersRes = await request(app).get('/api/admin/users').set('Cookie', aliceCookie);
    expect(usersRes.status).toBe(403);

    const txRes = await request(app).get('/api/admin/transactions').set('Cookie', aliceCookie);
    expect(txRes.status).toBe(403);
  });
});
