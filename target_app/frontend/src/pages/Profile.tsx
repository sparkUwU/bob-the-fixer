import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Save, CircleCheck, UploadCloud, FileText } from 'lucide-react';

interface UploadRecord {
  id: number;
  filename: string;
  filepath: string;
  uploaded_at: string;
}

const Profile = () => {
  const { user, refetch } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      loadUploads();
    }
  }, [user]);

  const loadUploads = async () => {
    const res = await fetch('/api/profile/uploads');
    if (res.ok) {
      const data = await res.json();
      setUploads(data.uploads || []);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
        await refetch();
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadError('');
    setUploadSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadSuccess(`"${data.file.original_name}" uploaded successfully.`);
        setUploadFile(null);
        (e.target as HTMLFormElement).reset();
        await loadUploads();
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch {
      setUploadError('Connection error');
    } finally {
      setUploading(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <Layout title="Profile">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left column: avatar + info */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
              <div className="profile-avatar-lg">{initials}</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.username}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>{user?.email}</div>
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${user?.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>Member since</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                  {user ? new Date(user.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span>User ID</span>
                <code style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>#{user?.id}</code>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Document Upload</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Upload supporting documents for your account.
            </div>

            {uploadSuccess && <div className="alert alert-success"><CircleCheck size={16} /> {uploadSuccess}</div>}
            {uploadError && <div className="alert alert-error">{uploadError}</div>}

            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Select File</label>
                {/* VULN-004: No accept="" restriction — any file type can be selected */}
                <input
                  id="profile-upload-input"
                  type="file"
                  className="form-input"
                  style={{ padding: '8px 12px', cursor: 'pointer' }}
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <button id="profile-upload-btn" className="btn btn-primary" type="submit" disabled={uploading || !uploadFile}>
                {uploading ? <span className="spinner" /> : <UploadCloud size={15} />}
                {uploading ? 'Uploading…' : 'Upload File'}
              </button>
            </form>

            {uploads.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--color-text-muted)' }}>
                  Uploaded Files
                </div>
                {uploads.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                    <FileText size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <a
                      href={`/uploads/${u.filepath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {u.filename}
                    </a>
                    <span style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }}>
                      {new Date(u.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: edit form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Edit Profile</div>

          {success && (
            <div className="alert alert-success">
              <CircleCheck size={16} /> Profile updated successfully!
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={user?.username || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <span style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 4, display: 'block' }}>Username cannot be changed</span>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="profile-email"
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button id="profile-save" className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : <Save size={15} />}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
