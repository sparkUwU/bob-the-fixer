import { useState, useEffect } from 'react'
import { api, severityColor, statusColor } from '../api'
import type { VulnBundle } from '../types'

const TYPE_LABELS: Record<string, string> = {
  IDOR: 'Broken Object-Level Authorization',
  SQLI: 'SQL Injection',
  XSS: 'Stored Cross-Site Scripting',
  FILE_UPLOAD: 'Unsafe File Upload',
  PRIVILEGE_ESCALATION: 'Broken Admin Authorization',
}

function lifecycleStatus(b: VulnBundle) {
  return {
    detected:    !!b.finding,
    confirmed:   b.judge?.validation_status === 'CONFIRMED',
    prioritized: !!b.risk,
    remediated:  b.patch?.status === 'PATCHED',
    verified:    !!b.verify,
    retested:    !!b.verify,
  }
}

function FindingDetail({ bundle, onBack }: { bundle: VulnBundle; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'discovery' | 'redteam' | 'judge' | 'risk' | 'patch' | 'verify'>('discovery')

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2 style={{ color: 'var(--text)' }}>{bundle.id} — {TYPE_LABELS[bundle.finding.type] ?? bundle.finding.type}</h2>
        <span className={`badge ${severityColor(bundle.finding.severity)}`}>{bundle.finding.severity.toUpperCase()}</span>
        {bundle.judge && <span className={`badge ${statusColor(bundle.judge.validation_status)}`}>{bundle.judge.validation_status}</span>}
      </div>

      <div className="tabs">
        {[
          { id: 'discovery', label: '1. Discovery' },
          { id: 'redteam',   label: '2. Red Team' },
          { id: 'judge',     label: '3. Judge' },
          { id: 'risk',      label: '4. Risk' },
          { id: 'patch',     label: '5. Blue Team' },
          { id: 'verify',    label: '6. Verification' },
        ].map(t => (
          <button
            key={t.id}
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'discovery' && (
        <div className="grid-2 fade-in">
          <div className="detail-panel">
            <h3 style={{ marginBottom: '1rem' }}>Attack Surface</h3>
            {[
              ['Endpoint',   bundle.finding.endpoint],
              ['Method',     bundle.finding.http_method],
              ['Category',   bundle.finding.type],
              ['Discovered', new Date(bundle.finding.timestamp).toLocaleString()],
            ].map(([k, v]) => (
              <div className="detail-field" key={k}>
                <div className="detail-field-label">{k}</div>
                <div className="detail-field-value" style={{ fontFamily: k === 'Endpoint' || k === 'Method' ? 'var(--mono)' : undefined }}>{v}</div>
              </div>
            ))}
            <div className="detail-field">
              <div className="detail-field-label">Description</div>
              <div className="detail-field-value">{bundle.finding.description}</div>
            </div>
          </div>
          <div className="detail-panel">
            <h3 style={{ marginBottom: '1rem' }}>Evidence</h3>
            <div className="detail-field">
              <div className="detail-field-label">HTTP Status</div>
              <div className="detail-field-value" style={{ fontFamily: 'var(--mono)' }}>{(bundle.finding.evidence as Record<string, unknown>)?.status_code as string}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Extracted Data</div>
              <div className="detail-field-value">{(bundle.finding.evidence as Record<string, unknown>)?.extracted_data as string}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'redteam' && (
        <div className="detail-panel fade-in">
          <h3 style={{ marginBottom: '1rem' }}>⚔️ Red Team Attack Evidence</h3>
          <div className="detail-field">
            <div className="detail-field-label">Exploit Target</div>
            <div className="detail-field-value" style={{ fontFamily: 'var(--mono)' }}>{bundle.finding.http_method} {bundle.finding.endpoint}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Test User</div>
            <div className="detail-field-value">{(bundle.finding.reproduction as Record<string, unknown>)?.test_user as string}</div>
          </div>
          {!!(bundle.finding.reproduction as Record<string, unknown>)?.url_params && (
            <div className="detail-field">
              <div className="detail-field-label">Attack Payload</div>
              <div className="artifact-viewer">
                <div className="artifact-body">
                  <pre>{JSON.stringify((bundle.finding.reproduction as Record<string, unknown>).url_params as Record<string, unknown>, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
          <div className="detail-field">
            <div className="detail-field-label">Response (truncated)</div>
            <div className="artifact-viewer">
              <div className="artifact-body" style={{ maxHeight: 140 }}>
                <pre>{String((bundle.finding.evidence as Record<string, unknown>)?.response_body).slice(0, 400)}…</pre>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span className="badge badge-red">EXPLOIT SUCCESSFUL</span>
          </div>
        </div>
      )}

      {activeTab === 'judge' && bundle.judge && (
        <div className="detail-panel fade-in">
          <h3 style={{ marginBottom: '1rem' }}>⚖️ Security Judge Validation</h3>
          <div className="detail-field">
            <div className="detail-field-label">Verdict</div>
            <span className={`badge ${statusColor(bundle.judge.validation_status)}`}>{bundle.judge.validation_status}</span>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Security Impact Verified</div>
            <div className="detail-field-value">{bundle.judge.security_impact_verified ? 'Yes' : 'No'}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Reproduction Log</div>
            <div className="detail-field-value" style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{bundle.judge.reproduction_log}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Reasoning</div>
            <div className="detail-field-value">{bundle.judge.reasoning}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Validated At</div>
            <div className="detail-field-value" style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem' }}>{new Date(bundle.judge.validated_at).toLocaleString()}</div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && bundle.risk && (
        <div className="grid-2 fade-in">
          <div className="detail-panel">
            <h3 style={{ marginBottom: '1rem' }}>📊 Risk Assessment</h3>
            {[
              ['Priority',     bundle.risk.priority],
              ['Risk Score',   String(bundle.risk.risk_score)],
              ['Required Privilege', bundle.risk.required_privilege],
              ['Remediation Urgency', bundle.risk.remediation_urgency],
            ].map(([k, v]) => (
              <div className="detail-field" key={k}>
                <div className="detail-field-label">{k}</div>
                <div className="detail-field-value" style={{ fontWeight: k === 'Risk Score' ? 700 : undefined, fontSize: k === 'Risk Score' ? '1.4rem' : undefined, color: k === 'Risk Score' ? (bundle.risk!.risk_score >= 9 ? 'var(--red)' : 'var(--amber)') : undefined }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="detail-panel">
            <div className="detail-field">
              <div className="detail-field-label">Exploitability</div>
              <div className="detail-field-value">{bundle.risk.exploitability}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Business Impact</div>
              <div className="detail-field-value">{bundle.risk.business_impact}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patch' && bundle.patch && (
        <div className="detail-panel fade-in">
          <h3 style={{ marginBottom: '1rem' }}>🛡️ Blue Team Remediation</h3>
          <div className="detail-field">
            <div className="detail-field-label">Status</div>
            <span className={`badge ${statusColor(bundle.patch.status)}`}>{bundle.patch.status}</span>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Root Cause</div>
            <div className="detail-field-value">{bundle.patch.root_cause}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Fix Description</div>
            <div className="detail-field-value">{bundle.patch.fix_description}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Files Changed</div>
            {bundle.patch.files_changed.map(f => (
              <div key={f} style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: '#60a5fa', marginTop: '0.25rem' }}>{f}</div>
            ))}
          </div>
          <div className="detail-field">
            <div className="detail-field-label">Regression Test</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: '#4ade80' }}>{bundle.patch.regression_test_file}</div>
          </div>
        </div>
      )}

      {activeTab === 'verify' && bundle.verify && (
        <div className="detail-panel fade-in">
          <h3 style={{ marginBottom: '1rem' }}>✅ Verification Results</h3>
          {[
            { label: 'Original Exploit',    val: bundle.verify.original_exploit,    green: bundle.verify.original_exploit === 'BLOCKED' },
            { label: 'Regression Test',     val: bundle.verify.regression_test,     green: bundle.verify.regression_test === 'PASSED' },
            { label: 'Legitimate Behavior', val: bundle.verify.legitimate_behavior, green: bundle.verify.legitimate_behavior === 'PASSED' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{row.label}</span>
              <span className={`badge ${row.green ? 'badge-green' : 'badge-red'}`}>{row.val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontWeight: 700 }}>Overall Status</span>
            <span className={`badge ${bundle.verify.overall_status.includes('REJECTED') ? 'badge-amber' : 'badge-green'}`}>
              {bundle.verify.overall_status}
            </span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
            {new Date(bundle.verify.verification_timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

export function FindingsPage() {
  const [findings, setFindings] = useState<VulnBundle[]>([])
  const [selected, setSelected] = useState<VulnBundle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.findings().then(f => { setFindings(f); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (selected) return (
    <div className="section">
      <div className="container">
        <FindingDetail bundle={selected} onBack={() => setSelected(null)} />
      </div>
    </div>
  )

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Findings</div>
          <h2>Security Findings</h2>
          <p>All vulnerabilities discovered and processed by the autonomous pipeline.</p>
        </div>

        {loading && <div className="empty-state"><div className="empty-state-icon">⟳</div><p>Loading findings…</p></div>}

        {!loading && findings.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🛡️</div>
            <h3>No security run yet</h3>
            <p>Launch the autonomous pipeline to begin.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {findings.map(b => {
            const lc = lifecycleStatus(b)
            return (
              <div key={b.id} className="finding-card" onClick={() => setSelected(b)}>
                <div className="finding-id">{b.id}</div>
                <div className="finding-title">{TYPE_LABELS[b.finding.type] ?? b.finding.type}</div>
                <div className="finding-meta">
                  <span className={`badge ${severityColor(b.finding.severity)}`}>{b.finding.severity.toUpperCase()}</span>
                  {b.judge && <span className={`badge ${statusColor(b.judge.validation_status)}`}>{b.judge.validation_status}</span>}
                  {b.patch && <span className={`badge ${statusColor(b.patch.status)}`}>{b.patch.status}</span>}
                  {b.risk && <span className="badge badge-purple">Score: {b.risk.risk_score}</span>}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>{b.finding.endpoint}</div>
                <div className="finding-lifecycle">
                  {([
                    ['Detected', lc.detected],
                    ['Confirmed', lc.confirmed],
                    ['Prioritized', lc.prioritized],
                    ['Remediated', lc.remediated],
                    ['Verified', lc.verified],
                  ] as [string, boolean][]).map(([label, done]) => (
                    <span key={label} className={`lifecycle-step ${done ? 'done' : 'pending'}`}>{done ? '✓' : '○'} {label}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
