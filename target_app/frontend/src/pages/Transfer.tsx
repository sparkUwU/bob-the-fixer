import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Send, CircleCheck } from 'lucide-react';

const Transfer = () => {
  const [form, setForm] = useState({ to_account_number: '', amount: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setForm({ to_account_number: '', amount: '', description: '' });
      } else {
        setError(data.error || 'Transfer failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Transfer Funds">
      <div className="page-header">
        <h1>Send Money</h1>
        <p>Transfer funds to another SecureBank account instantly</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card form-section" style={{ maxWidth: '100%' }}>
          <div className="card-title" style={{ marginBottom: 20 }}>Transfer Details</div>

          {success && (
            <div className="alert alert-success">
              <CircleCheck size={16} />
              Transfer completed successfully!
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Recipient Account Number</label>
              <input
                id="transfer-to"
                className="form-input"
                placeholder="e.g. ACC-1002"
                value={form.to_account_number}
                onChange={set('to_account_number')}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (USD)</label>
              <input
                id="transfer-amount"
                className="form-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={set('amount')}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description <span style={{ color: 'var(--color-text-subtle)' }}>(optional)</span></label>
              <input
                id="transfer-desc"
                className="form-input"
                placeholder="e.g. Rent, Dinner, etc."
                value={form.description}
                onChange={set('description')}
              />
            </div>
            <button id="transfer-submit" className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : <Send size={15} />}
              {loading ? 'Processing…' : 'Send Transfer'}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Demo Accounts</div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 12 }}>
              Use these account numbers to test transfers:
            </p>
            {[
              { name: 'Alice', num: 'ACC-1001' },
              { name: 'Bob', num: 'ACC-1002' },
              { name: 'Charlie', num: 'ACC-1003' },
            ].map(acc => (
              <div key={acc.num} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 500 }}>{acc.name}</span>
                <code style={{ fontSize: 12, color: 'var(--color-primary)', fontFamily: 'monospace' }}>{acc.num}</code>
              </div>
            ))}
          </div>
          <div className="alert alert-info">
            <span>Transfers are atomic — they either complete fully or roll back. No partial states.</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Transfer;
