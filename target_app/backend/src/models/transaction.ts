
import { getDb } from '../config/database';

export interface Transaction {
  id: number;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

export const getTransactionsForAccount = (accountId: number): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT * FROM transactions WHERE from_account_id = ? OR to_account_id = ? ORDER BY created_at DESC', [accountId, accountId], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows as Transaction[]);
    });
  });
};

export const transferFunds = (fromAccountId: number, toAccountId: number, amount: number, description: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get('SELECT balance FROM accounts WHERE id = ?', [fromAccountId], (err, row: any) => {
        if (err || !row) return db.run('ROLLBACK', () => reject(err || new Error('From account not found')));
        if (row.balance < amount) return db.run('ROLLBACK', () => reject(new Error('Insufficient funds')));

        db.get('SELECT balance FROM accounts WHERE id = ?', [toAccountId], (err, row: any) => {
          if (err || !row) return db.run('ROLLBACK', () => reject(err || new Error('To account not found')));

          db.run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromAccountId], (err) => {
            if (err) return db.run('ROLLBACK', () => reject(err));

            db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toAccountId], (err) => {
              if (err) return db.run('ROLLBACK', () => reject(err));

              db.run(
                'INSERT INTO transactions (from_account_id, to_account_id, amount, description, status) VALUES (?, ?, ?, ?, ?)',
                [fromAccountId, toAccountId, amount, description, 'completed'],
                (err) => {
                  if (err) return db.run('ROLLBACK', () => reject(err));

                  db.run('COMMIT', (err) => {
                    db.close();
                    if (err) reject(err);
                    else resolve();
                  });
                }
              );
            });
          });
        });
      });
    });
  });
};

export const getTransactionById = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const getAllTransactions = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT * FROM transactions ORDER BY created_at DESC', (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
