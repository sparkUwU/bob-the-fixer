import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from '../config/database';

// Upload directory — always inside a controlled sandbox folder
const UPLOAD_DIR = path.join(__dirname, '../../../data/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// VULN-004: Unsafe File Upload
// Vulnerability: No file type validation. Multer accepts ANY file extension
// (e.g., .html, .svg, .exe). The original filename is also preserved with
// only a timestamp prefix, allowing filename-based attacks.
//
// Mitigating constraint:
//   - Files are NEVER executed server-side.
//   - They are served as static downloads only via the /uploads route.
//   - The upload directory is NOT the web root.
//   - Node.js/Express does not auto-execute stored files.
//
// Safe because:  no shell execution, no PHP, no .htaccess, no CGI.
// Vulnerable because: no MIME validation, no extension allowlist, original
//                     filenames partially preserved (path-traversal surface).
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Preserve the original filename with a timestamp prefix
    // No extension filtering, no sanitization of the filename
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

export const uploadProfileFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Record upload in database
  const db = getDb();
  db.run(
    'INSERT INTO uploads (user_id, filename, filepath) VALUES (?, ?, ?)',
    [req.user!.id, req.file.originalname, req.file.filename],
    function (err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({
        message: 'File uploaded successfully',
        file: {
          original_name: req.file!.originalname,
          stored_name: req.file!.filename,
          size: req.file!.size,
          mimetype: req.file!.mimetype,
        },
      });
    }
  );
};

export const getMyUploads = (req: Request, res: Response) => {
  const db = getDb();
  db.all(
    'SELECT * FROM uploads WHERE user_id = ? ORDER BY uploaded_at DESC',
    [req.user!.id],
    (err, rows) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ uploads: rows });
    }
  );
};
