import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const getDbPath = () => process.env.DB_PATH || path.join(__dirname, '../../data/securebank.db');

export const getDb = (): sqlite3.Database => {
  return new sqlite3.Database(getDbPath(), (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
    }
  });
};

export const initializeDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(getDbPath());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const db = getDb();
    
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password_hash TEXT,
          email TEXT UNIQUE,
          role TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create accounts table
      db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          account_number TEXT UNIQUE,
          balance REAL,
          account_type TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);

      // Create transactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          from_account_id INTEGER,
          to_account_id INTEGER,
          amount REAL,
          description TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(from_account_id) REFERENCES accounts(id),
          FOREIGN KEY(to_account_id) REFERENCES accounts(id)
        )
      `);

      // Create uploads table
      db.run(`
        CREATE TABLE IF NOT EXISTS uploads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          filename TEXT,
          filepath TEXT,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);

      // Create sessions table
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_token TEXT UNIQUE,
          user_id INTEGER,
          expires_at DATETIME,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);
    });

    db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count === 0) {
        seedDatabase(db).then(resolve).catch(reject);
      } else {
        console.log('Database already seeded.');
        resolve();
      }
    });
  });
};

const seedDatabase = (db: sqlite3.Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Seeding database with deterministic demo data...');
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      const insertUser = db.prepare('INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)');
      // Demo-only passwords: using plaintext for testing purposes right now (or a simple hash placeholder)
      insertUser.run('Alice', 'password123', 'alice@securebank.local', 'USER');
      insertUser.run('Bob', 'password123', 'bob@securebank.local', 'USER');
      insertUser.run('Charlie', 'password123', 'charlie@securebank.local', 'USER');
      insertUser.run('Admin', 'admin123', 'admin@securebank.local', 'ADMIN');
      insertUser.finalize();

      const insertAccount = db.prepare('INSERT INTO accounts (user_id, account_number, balance, account_type) VALUES (?, ?, ?, ?)');
      insertAccount.run(1, 'ACC-1001', 12500, 'checking');
      insertAccount.run(2, 'ACC-1002', 8700, 'checking');
      insertAccount.run(3, 'ACC-1003', 4200, 'checking');
      insertAccount.finalize();

      const insertTx = db.prepare('INSERT INTO transactions (from_account_id, to_account_id, amount, description, status) VALUES (?, ?, ?, ?, ?)');
      insertTx.run(1, 2, 500, 'Rent payment', 'completed');
      insertTx.run(2, 3, 100, 'Dinner', 'completed');
      insertTx.finalize();

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error seeding database:', err);
          reject(err);
        } else {
          console.log('Database seeded successfully.');
          resolve();
        }
      });
    });
  });
};
