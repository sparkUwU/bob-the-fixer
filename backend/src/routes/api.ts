import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createTransfer } from '../controllers/transfer';
import { getTransactions, getTransaction, searchTransactions } from '../controllers/transaction';
import { getProfile, updateProfile } from '../controllers/user';
import { getUsers, getTransactionsAdmin, requireAdmin } from '../controllers/admin';
import { getMyAccount } from '../controllers/account';
import { upload, uploadProfileFile, getMyUploads } from '../controllers/upload';

const router = Router();

// All API routes except auth require authentication
router.use(authenticate);

// Accounts
router.get('/accounts/me', getMyAccount);

// Transfers
router.post('/transfers', createTransfer);

// Transactions
router.get('/transactions', getTransactions);
router.get('/transactions/search', searchTransactions);
router.get('/transactions/:id', getTransaction);

// Profile
router.get('/users/:id', getProfile);
router.put('/users/:id', updateProfile);

// Uploads
router.post('/profile/upload', upload.single('file'), uploadProfileFile);
router.get('/profile/uploads', getMyUploads);

// Admin
router.get('/admin/users', requireAdmin, getUsers);
router.get('/admin/transactions', requireAdmin, getTransactionsAdmin);

export default router;
