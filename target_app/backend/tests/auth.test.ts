import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { initializeDatabase } from '../src/config/database';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, `../../data/auth-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;

describe('Authentication Flow', () => {
  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch (e) {}
    }
    await initializeDatabase();
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  let sessionCookie: string;

  it('should reject invalid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should accept valid login and set cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('Alice');
    expect(res.headers['set-cookie']).toBeDefined();
    
    // Save cookie for next tests
    sessionCookie = res.headers['set-cookie'][0].split(';')[0];
  });

  it('should allow accessing protected endpoint with valid session', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('Alice');
  });

  it('should reject accessing protected endpoint without authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should logout user and clear session', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', sessionCookie);
    expect(res.status).toBe(200);

    // Verify session is invalidated
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);
    expect(meRes.status).toBe(401);
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'NewUser',
        password: 'securePassword1',
        email: 'newuser@securebank.local'
      });
    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe('NewUser');
  });
});
