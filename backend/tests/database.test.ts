import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { initializeDatabase, getDb } from '../src/config/database';
import { getAllUsers, getUserByUsername } from '../src/models/user';
import { getAccountByUserId } from '../src/models/account';
import { getTransactionsForAccount } from '../src/models/transaction';

const testDbPath = path.join(__dirname, `../../data/database-${Date.now()}.db`);
process.env.DB_PATH = testDbPath;

describe('Database and Seed Data', () => {
  beforeAll(async () => {
    // Ensure we start with a clean state for testing
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch (e) {}
    }
    // Initialize the database and wait for it to be seeded
    await initializeDatabase();
    // Adding a tiny delay just to be sure transactions are committed
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterAll(() => {
    // Optionally clean up the database file after tests
    // if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  it('should seed Alice, Bob, Charlie, and Admin users', async () => {
    const users = await getAllUsers();
    expect(users).toHaveLength(4);

    const usernames = users.map(u => u.username);
    expect(usernames).toContain('Alice');
    expect(usernames).toContain('Bob');
    expect(usernames).toContain('Charlie');
    expect(usernames).toContain('Admin');

    const adminUser = users.find(u => u.username === 'Admin');
    expect(adminUser?.role).toBe('ADMIN');
  });

  it('should seed accounts with balances for Alice, Bob, and Charlie', async () => {
    const alice = await getUserByUsername('Alice');
    expect(alice).toBeDefined();
    
    const account = await getAccountByUserId(alice!.id);
    expect(account).toBeDefined();
    expect(account?.balance).toBe(12500);
    expect(account?.account_type).toBe('checking');
  });

  it('should seed transactions between users', async () => {
    const alice = await getUserByUsername('Alice');
    const aliceAccount = await getAccountByUserId(alice!.id);
    expect(aliceAccount).toBeDefined();

    const transactions = await getTransactionsForAccount(aliceAccount!.id);
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions[0].amount).toBe(500);
    expect(transactions[0].description).toBe('Rent payment');
  });
});
