/**
 * Security Test: VULN-003 — Stored XSS via Transaction Description
 *
 * Attack surface: POST /api/transfers (description field) → GET /api/transactions
 *
 * BEFORE remediation: EXPLOIT REPRODUCED
 *   - The backend stores the description unescaped.
 *   - The frontend renders it via dangerouslySetInnerHTML.
 *   - When the victim views Dashboard or Transactions, the script executes.
 *
 * AFTER remediation: EXPLOIT BLOCKED
 *   - The backend sanitizes description inputs (e.g., with DOMPurify server-side
 *     or by escaping HTML entities before storage).
 *   - The frontend uses standard React rendering ({tx.description}) which auto-escapes.
 *   - To verify: add an HTML sanitizer and replace dangerouslySetInnerHTML in
 *     Dashboard.tsx and Transactions.tsx.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';

describe('[SECURITY] VULN-003: Stored XSS via Transaction Description', () => {
  let aliceCookie: string[];
  let bobCookie: string[];

  beforeAll(async () => {
    await initializeDatabase();

    const aliceLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'password123' });
    aliceCookie = aliceLogin.headers['set-cookie'];

    const bobLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Bob', password: 'password123' });
    bobCookie = bobLogin.headers['set-cookie'];
  });

  it('[EXPLOIT REPRODUCED] XSS payload stored and returned unescaped in transaction description', async () => {
    const xssPayload = '<img src=x onerror="alert(\'XSS-DEMO\')">';

    // Alice sends XSS payload as transaction description
    const transferRes = await request(app)
      .post('/api/transfers')
      .set('Cookie', aliceCookie)
      .send({ to_account_number: 'ACC-1002', amount: 1, description: xssPayload });
    expect(transferRes.status).toBe(200);

    // Bob retrieves his transactions — the payload is returned verbatim
    const txRes = await request(app)
      .get('/api/transactions')
      .set('Cookie', bobCookie);
    expect(txRes.status).toBe(200);

    const maliciousTx = txRes.body.transactions.find(
      (tx: any) => tx.description === xssPayload
    );
    // Vulnerable: payload is stored and served unsanitized
    expect(maliciousTx).toBeDefined();
    expect(maliciousTx.description).toContain('<img');

    // After remediation this should fail:
    // expect(maliciousTx.description).not.toContain('<img');
    // expect(maliciousTx.description).toContain('&lt;img');
  });

  it('[BASELINE] Normal description is stored and returned correctly', async () => {
    const transferRes = await request(app)
      .post('/api/transfers')
      .set('Cookie', aliceCookie)
      .send({ to_account_number: 'ACC-1002', amount: 1, description: 'Normal payment' });
    expect(transferRes.status).toBe(200);

    const txRes = await request(app).get('/api/transactions').set('Cookie', aliceCookie);
    const tx = txRes.body.transactions.find((t: any) => t.description === 'Normal payment');
    expect(tx).toBeDefined();
  });
});
