/**
 * Security Test: VULN-004 — Unsafe File Upload
 *
 * Endpoint: POST /api/profile/upload
 *
 * BEFORE remediation: EXPLOIT REPRODUCED
 *   - No file type validation: any extension (.html, .svg, .exe) is accepted.
 *   - Files stored with original extension inside data/uploads/.
 *   - .html/.svg files served to browsers will execute embedded scripts.
 *
 * AFTER remediation: EXPLOIT BLOCKED
 *   - Server enforces an extension allowlist (e.g. jpg, png, pdf, txt).
 *   - MIME type is validated against the allowlist.
 *   - Stored filename has the extension stripped/replaced.
 *   - To verify: add extension validation to the multer diskStorage config
 *     in backend/src/controllers/upload.ts.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { initializeDatabase } from '../../src/config/database';
import fs from 'fs';
import path from 'path';

describe('[SECURITY] VULN-004: Unsafe File Upload', () => {
  let cookie: string[];

  beforeAll(async () => {
    await initializeDatabase();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice', password: 'password123' });
    expect(loginRes.status).toBe(200);
    cookie = loginRes.headers['set-cookie'];
  });

  afterAll(() => {
    const uploadDir = path.join(__dirname, '../../../data/uploads');
    if (fs.existsSync(uploadDir)) {
      for (const f of fs.readdirSync(uploadDir)) {
        if (f.includes('test-')) {
          try { fs.unlinkSync(path.join(uploadDir, f)); } catch {}
        }
      }
    }
  });

  it('[BASELINE] Accepts a legitimate image upload', async () => {
    const res = await request(app)
      .post('/api/profile/upload')
      .set('Cookie', cookie)
      .attach('file', Buffer.from('fake-png-bytes'), {
        filename: 'test-profile.png',
        contentType: 'image/png',
      });
    expect(res.status).toBe(200);
    expect(res.body.file.original_name).toBe('test-profile.png');
  });

  it('[EXPLOIT REPRODUCED] Accepts .html file with embedded script — no extension validation', async () => {
    const htmlPayload = '<script>alert("XSS-DEMO")</script>';
    const res = await request(app)
      .post('/api/profile/upload')
      .set('Cookie', cookie)
      .attach('file', Buffer.from(htmlPayload), {
        filename: 'test-malicious.html',
        contentType: 'text/html',
      });

    // Vulnerable: server accepts html file with 200
    expect(res.status).toBe(200);
    expect(res.body.file.original_name).toBe('test-malicious.html');

    // After remediation this should fail:
    // expect(res.status).toBe(400);
  });

  it('[EXPLOIT REPRODUCED] Accepts .svg file with inline JavaScript — no MIME validation', async () => {
    const svgPayload = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert('XSS-DEMO')</script></svg>`;
    const res = await request(app)
      .post('/api/profile/upload')
      .set('Cookie', cookie)
      .attach('file', Buffer.from(svgPayload), {
        filename: 'test-malicious.svg',
        contentType: 'image/svg+xml',
      });

    expect(res.status).toBe(200);
    expect(res.body.file.original_name).toBe('test-malicious.svg');

    // After remediation:
    // expect(res.status).toBe(400);
  });

  it('[BASELINE] Lists uploaded files for authenticated user', async () => {
    const res = await request(app)
      .get('/api/profile/uploads')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.uploads).toBeInstanceOf(Array);
    expect(res.body.uploads.length).toBeGreaterThan(0);
  });
});
