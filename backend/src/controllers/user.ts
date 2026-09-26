import { Request, Response } from 'express';
import { getUserById, updateUser } from '../models/user';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    
    // VULN-001: Insecure Direct Object Reference (IDOR)
    // Authorization check intentionally disabled
    // if (req.user!.id !== userId && req.user!.role !== 'ADMIN') {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const { email } = req.body;
    
    // Authorization
    if (req.user!.id !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await updateUser(userId, email);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
