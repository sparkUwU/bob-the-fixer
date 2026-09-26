import { getDb } from '../config/database';

export interface Session {
  id: number;
  session_token: string;
  user_id: number;
  expires_at: string;
}

export const createSession = (sessionToken: string, userId: number, expiresAt: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(
      'INSERT INTO sessions (session_token, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionToken, userId, expiresAt],
      (err) => {
        db.close();
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const getSession = (sessionToken: string): Promise<Session | undefined> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT * FROM sessions WHERE session_token = ?', [sessionToken], (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row as Session | undefined);
    });
  });
};

export const deleteSession = (sessionToken: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('DELETE FROM sessions WHERE session_token = ?', [sessionToken], (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
};
