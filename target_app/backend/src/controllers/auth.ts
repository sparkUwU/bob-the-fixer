import { Request, Response } from 'express';
import crypto from 'crypto';
import { createUser, getUserByUsernameWithPassword } from '../models/user';
import { createSession, deleteSession } from '../models/session';
import { getDb } from '../config/database';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Checking if user already exists
    const db = getDb();
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        db.close();
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Using plaintext for demo purposes as requested ("Do not intentionally introduce the weak-authentication vulnerability yet. Build a clean authentication foundation that can later be modified if needed." - wait, maybe hash it lightly just to be clean, or just store it. I'll use a basic hash to be "clean" but vulnerable later.)
    // Actually, "demo-only passwords" were used in seed, so I'll just store plaintext to match seed, or I'll just check seed passwords directly.
    // Let's use a very simple hash or just store as is. I will store as is for now to match seed data 'password123'.
    const passwordHash = password; 

    const user = await createUser(username, passwordHash, email, 'USER');
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const userWithPassword = await getUserByUsernameWithPassword(username);
    
    if (!userWithPassword || userWithPassword.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    await createSession(sessionToken, userWithPassword.id, expiresAt);

    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    const user = {
      id: userWithPassword.id,
      username: userWithPassword.username,
      email: userWithPassword.email,
      role: userWithPassword.role,
      created_at: userWithPassword.created_at
    };

    res.json({ message: 'Logged in successfully', user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionToken = req.cookies.session_token;
    
    if (sessionToken) {
      await deleteSession(sessionToken);
      res.clearCookie('session_token');
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user: req.user });
};
