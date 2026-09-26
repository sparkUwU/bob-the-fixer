import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Activity } from 'lucide-react';

interface Transaction {
  id: number;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, accRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/accounts/me'),
        ]);
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
        if (accRes.ok) {
          const accData = await accRes.json();
          setAccountId(accData.account?.id ?? null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Layout title="Transactions">
        <div className="loading-page"><span className="spinner" style={{ width: 28, height: 28 }} /><span>Loading transactions…</span></div>
      </Layout>
    );
  }

  return (
    <Layout title="Transactions">
      <div className="page-header">
        <h1>Transaction History</h1>
        <p>{transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="card">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <Activity size={32} />
            <h3>No transactions yet</h3>
            <p>Your completed transfers will appear here</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const isIn = tx.to_account_id === accountId;
                  return (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#{tx.id}</td>
                      {/* VULN-003: Cross-Site Scripting (XSS) */}
                      <td style={{ fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: tx.description || '—' }} />
                      <td>
                        <span className={`badge ${isIn ? 'badge-green' : 'badge-red'}`}>
                          {isIn ? 'Received' : 'Sent'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(tx.created_at).toLocaleString()}
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
    </Layout>
  );
};

export default Transactions;
