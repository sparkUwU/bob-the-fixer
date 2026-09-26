import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Activity, Send } from 'lucide-react';

interface Account {
  id: number;
  account_number: string;
  balance: number;
  account_type: string;
}

interface Transaction {
  id: number;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [, txRes] = await Promise.all([
          fetch(`/api/users/${user?.id}`),
          fetch('/api/transactions'),
        ]);
        // We get the account from a dedicated accounts endpoint
        const accData = await fetch(`/api/accounts/me`).then(r => r.ok ? r.json() : null);
        if (accData) setAccount(accData.account);

        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const totalIn = transactions
    .filter(tx => tx.to_account_id === account?.id)
    .reduce((s, tx) => s + tx.amount, 0);

  const totalOut = transactions
    .filter(tx => tx.from_account_id === account?.id)
    .reduce((s, tx) => s + tx.amount, 0);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="loading-page"><span className="spinner" style={{ width: 28, height: 28 }} /><span>Loading your dashboard…</span></div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="page-header">
        <h1>Good day, {user?.username} 👋</h1>
        <p>Here's your financial overview</p>
      </div>

      {/* Account Card */}
      {account && (
        <div className="account-card" style={{ marginBottom: 24 }}>
          <div className="account-card-label">Available Balance</div>
          <div className="account-card-balance">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="account-card-number">{account.account_number}</div>
          <div className="account-card-type">{account.account_type} account</div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon green"><ArrowDownLeft size={18} /></div>
          <div className="stat-label">Total Received</div>
          <div className="stat-value amount-in">${totalIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Incoming transfers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><ArrowUpRight size={18} /></div>
          <div className="stat-label">Total Sent</div>
          <div className="stat-value amount-out">${totalOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">Outgoing transfers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Activity size={18} /></div>
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-sub">Total activity</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Transactions</div>
            <div className="card-subtitle">Your last {Math.min(5, transactions.length)} transfers</div>
          </div>
          <Link to="/transactions" className="btn btn-ghost btn-sm">View All</Link>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <Activity size={32} />
            <h3>No transactions yet</h3>
            <p>Your transfers will appear here</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(tx => {
                  const isIn = tx.to_account_id === account?.id;
                  return (
                    <tr key={tx.id}>
                      {/* VULN-003: Cross-Site Scripting (XSS) */}
                      <td style={{ fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: tx.description || 'Transfer' }} />
                      <td style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td><span className="badge badge-green">{tx.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={isIn ? 'amount-in' : 'amount-out'}>
                          {isIn ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
        <Link to="/transfer" className="btn btn-primary">
          <Send size={15} /> New Transfer
        </Link>
        <Link to="/transactions" className="btn btn-ghost">View All Transactions</Link>
      </div>
    </Layout>
  );
};

export default Dashboard;
