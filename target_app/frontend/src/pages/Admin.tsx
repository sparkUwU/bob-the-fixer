import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, ShieldCheck } from 'lucide-react';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface AdminTransaction {
  id: number;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'transactions'>('users');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    const load = async () => {
      try {
        const [usersRes, txRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/transactions'),
        ]);
        const usersData = await usersRes.json();
        const txData = await txRes.json();
        setUsers(usersData.users || []);
        setTransactions(txData.transactions || []);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  if (loading) {
    return (
      <Layout title="Admin Panel">
        <div className="loading-page"><span className="spinner" style={{ width: 28, height: 28 }} /><span>Loading admin data…</span></div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Panel">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>System-wide view of all users and transactions</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={18} /></div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Activity size={18} /></div>
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{transactions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><ShieldCheck size={18} /></div>
          <div className="stat-label">Admin Accounts</div>
          <div className="stat-value">{users.filter(u => u.role === 'ADMIN').length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['users', 'transactions'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          >
            {t === 'users' ? <Users size={13} /> : <Activity size={13} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">All Users</div>
            <span className="badge badge-blue">{users.length} total</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Member Since</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#{u.id}</td>
                    <td style={{ fontWeight: 500 }}>{u.username}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">All Transactions</div>
            <span className="badge badge-blue">{transactions.length} total</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>From Acct</th>
                  <th>To Acct</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#{tx.id}</td>
                    <td><code style={{ fontSize: 12 }}>{tx.from_account_id}</code></td>
                    <td><code style={{ fontSize: 12 }}>{tx.to_account_id}</code></td>
                    <td>{tx.description || '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{new Date(tx.created_at).toLocaleString()}</td>
                    <td><span className="badge badge-green">{tx.status}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Admin;
