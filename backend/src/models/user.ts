
import { getDb } from '../config/database';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export const getAllUsers = (): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT id, username, email, role, created_at FROM users', (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows as User[]);
    });
  });
};

export const getUserByUsername = (username: string): Promise<User | undefined> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT id, username, email, role, created_at FROM users WHERE username = ?', [username], (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row as User | undefined);
    });
  });
};

export const getUserById = (id: number): Promise<User | undefined> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id], (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row as User | undefined);
    });
  });
};

export const getUserByUsernameWithPassword = (username: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const createUser = (username: string, passwordHash: string, email: string, role: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(
      'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
      [username, passwordHash, email, role],
      function (err) {
        if (err) {
          db.close();
          reject(err);
        } else {
          db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [this.lastID], (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row as User);
          });
        }
      }
    );
  });
};

export const updateUser = (id: number, email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('UPDATE users SET email = ? WHERE id = ?', [email, id], (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
};
