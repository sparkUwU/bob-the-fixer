import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files as static downloads (never executed)
// Files land in data/uploads/ which is outside the web root
const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export { app };
