import { Request, Response } from 'express';
import { getAccountByUserId } from '../models/account';

export const getMyAccount = async (req: Request, res: Response) => {
  try {
    const account = await getAccountByUserId(req.user!.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ account });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
