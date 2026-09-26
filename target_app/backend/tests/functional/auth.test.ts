/**
 * Functional Test: Authentication
 * Tests normal auth flows — login, logout, registration, session handling.
 * These should ALL PASS regardless of vulnerability state.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, `../../../data/func-auth-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;

describe('[FUNCTIONAL] Authentication', () => {
  let sessionCookie: string;

  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch {}
    }
    await initializeDatabase();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('accepts valid login and sets session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('Alice');
    expect(res.body.user.role).toBe('USER');
    expect(res.headers['set-cookie']).toBeDefined();
    sessionCookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('allows access to protected endpoint with valid session', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('Alice');
  });

  it('rejects unauthenticated access to protected endpoint', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('logs out and invalidates the session', async () => {
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', sessionCookie);
    expect(logoutRes.status).toBe(200);

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);
    expect(meRes.status).toBe(401);
  });

  it('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'FunctionalTestUser', password: 'pass1234', email: 'func@securebank.local' });
    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe('FunctionalTestUser');
  });

  it('rejects duplicate username registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'Alice', password: 'pass1234', email: 'uniqueemail@securebank.local' });
    expect(res.status).toBe(409);
  });
});
