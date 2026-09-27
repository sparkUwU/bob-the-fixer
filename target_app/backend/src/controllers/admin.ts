import { Request, Response, NextFunction } from 'express';
import { getAllUsers } from '../models/user';
import { getAllTransactions } from '../models/transaction';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // VULN-005: Broken Admin Authorization / Privilege Escalation
  // The middleware trusts a client-supplied header to bypass the role check.
  // Any authenticated user who sends "X-Admin-Override: true" gains admin access.
  // Correct implementation: ONLY check req.user.role — never trust client headers for authz.
  // Client header override check removed for security

  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactionsAdmin = async (req: Request, res: Response) => {
  try {
    const transactions = await getAllTransactions();
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
