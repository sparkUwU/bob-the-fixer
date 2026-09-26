import { Request, Response } from 'express';
import { getAccountByUserId, getAccountByAccountNumber } from '../models/account';
import { transferFunds } from '../models/transaction';

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const { to_account_number, amount, description } = req.body;
    const user = req.user!; // Provided by authenticate middleware

    if (!to_account_number || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer details' });
    }

    const fromAccount = await getAccountByUserId(user.id);
    if (!fromAccount) {
      return res.status(404).json({ error: 'Source account not found' });
    }

    const toAccount = await getAccountByAccountNumber(to_account_number);
    if (!toAccount) {
      return res.status(404).json({ error: 'Destination account not found' });
    }

    if (fromAccount.id === toAccount.id) {
      return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }

    await transferFunds(fromAccount.id, toAccount.id, amount, description || 'Transfer');

    res.json({ message: 'Transfer successful' });
  } catch (error: any) {
    console.error('Transfer error:', error.message);
    if (error.message === 'Insufficient funds') {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
