
import { getDb } from '../config/database';

export interface Account {
  id: number;
  user_id: number;
  account_number: string;
  balance: number;
  account_type: string;
}

export const getAccountByUserId = (userId: number): Promise<Account | undefined> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT * FROM accounts WHERE user_id = ?', [userId], (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row as Account | undefined);
    });
  });
};

export const getAccountByAccountNumber = (accountNumber: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT * FROM accounts WHERE account_number = ?', [accountNumber], (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
};
