import { Request, Response } from 'express';
import { getAccountByUserId } from '../models/account';
import { getTransactionsForAccount, getTransactionById } from '../models/transaction';
import { getDb } from '../config/database';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const account = await getAccountByUserId(user.id);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const transactions = await getTransactionsForAccount(account.id);
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const txId = parseInt(req.params.id as string);
    
    if (isNaN(txId)) {
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    const transaction = await getTransactionById(txId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Authorization check
    const account = await getAccountByUserId(user.id);
    if (!account || (transaction.from_account_id !== account.id && transaction.to_account_id !== account.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchTransactions = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const account = await getAccountByUserId(user.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const query = (req.query.q as string) || '';
    
    // VULN-002: SQL Injection
    // The query string is directly concatenated into the SQL statement
    const db = getDb();
    const sql = `
      SELECT * FROM transactions 
      WHERE (from_account_id = ? OR to_account_id = ?)
      AND description LIKE ?
    `;

    db.all(sql, [account.id, account.id, `%${query}%`], (err, rows) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json({ transactions: rows });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
