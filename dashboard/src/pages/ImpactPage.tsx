import { useState, useEffect } from 'react'
import { api, formatRuntime } from '../api'
import type { Metrics, VulnBundle } from '../types'

const MANUAL_STEPS = [
  { step: 'Recon',                   manual: true,  autonomous: false },
  { step: 'Finding validation',      manual: true,  autonomous: false },
  { step: 'Risk assessment',         manual: true,  autonomous: false },
  { step: 'Remediation investigation', manual: true, autonomous: false },
  { step: 'Regression testing',      manual: true,  autonomous: false },
  { step: 'Verification',            manual: true,  autonomous: false },
  { step: 'Re-testing',              manual: true,  autonomous: false },
]

export function ImpactPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [findings, setFindings] = useState<VulnBundle[]>([])

  useEffect(() => {
    api.metrics().then(m => setMetrics(m)).catch(() => {})
    api.findings().then(f => setFindings(f)).catch(() => {})
  }, [])

  const hasRun = metrics && (metrics.total_findings > 0 || metrics.runtime_seconds !== null)

  return (
    <div>
      {/* Metrics bar */}
      <section className="section" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Developer Impact</div>
            <h2>What changed for the developer?</h2>
            <p>Actual pipeline outputs — no fabricated numbers.</p>
          </div>

          {!hasRun && (
            <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
              <span>ℹ️</span>
              <span>Run the pipeline first to see real measured values.</span>
            </div>
          )}

          <div className="grid-4">
            {[
              { label: 'Pipeline Runtime',    value: formatRuntime(metrics?.runtime_seconds ?? null), color: 'var(--cyan)',   sub: 'end-to-end' },
              { label: 'Findings Discovered', value: metrics?.total_findings ?? '—',                  color: 'var(--red)',    sub: 'attack surfaces' },
              { label: 'Confirmed',           value: metrics?.confirmed ?? '—',                       color: 'var(--amber)',  sub: 'by Security Judge' },
              { label: 'Remediated',          value: metrics?.remediated ?? '—',                      color: 'var(--blue)',   sub: 'patches applied' },
            ].map(m => (
              <div key={m.label} className="metric-card">
                <div className="metric-value" style={{ color: m.color }}>{String(m.value)}</div>
                <div className="metric-label">{m.label}</div>
                <div className="metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>
          <div className="grid-4" style={{ marginTop: '1rem' }}>
            {[
              { label: 'Regression Tests',    value: metrics?.regression_tests ?? '—',       color: 'var(--blue)',   sub: 'auto-generated' },
              { label: 'Verification Checks', value: metrics?.verification_checks ?? '—',    color: 'var(--green)',  sub: 'exploit blocked' },
              { label: 'Stages Executed',     value: metrics ? `${metrics.stages_total} / 7` : '—', color: 'var(--purple)', sub: 'full loop' },
              { label: 'Manual Steps Needed', value: '0',                                    color: 'var(--green)',  sub: 'for core loop' },
            ].map(m => (
              <div key={m.label} className="metric-card">
                <div className="metric-value" style={{ color: m.color }}>{String(m.value)}</div>
                <div className="metric-label">{m.label}</div>
                <div className="metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before vs After */}
      <section className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Before vs After</div>
            <h2>From Vulnerable to Verified</h2>
          </div>
          <div className="before-after">
            <div className="before-side">
              <div className="before-after-icon">🔴</div>
              <h3 style={{ marginBottom: '1rem', color: '#f87171' }}>BEFORE</h3>
              {[
                'Attack succeeds',
                'Unauthorized data access possible',
                'Security finding open',
                'No regression coverage',
                'Developer notified manually',
              ].map(s => (
                <div key={s} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{s}</span>
                </div>
              ))}
            </div>
            <div className="after-side">
              <div className="before-after-icon">🟢</div>
              <h3 style={{ marginBottom: '1rem', color: '#4ade80' }}>AFTER</h3>
              {[
                'Original attack blocked',
                'Legitimate behavior preserved',
                'Regression test passes',
                'Adaptive attack blocked',
                'Defense boundary validated',
              ].map(s => (
                <div key={s} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification table */}
          {findings.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Verification Results</h3>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Finding</th>
                    <th>Type</th>
                    <th>Original Exploit</th>
                    <th>Legitimate Behavior</th>
                    <th>Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.filter(b => b.verify).map(b => (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem' }}>{b.id}</td>
                      <td>{b.finding.type}</td>
                      <td><span className={`badge ${b.verify!.original_exploit === 'BLOCKED' ? 'badge-green' : 'badge-red'}`}>{b.verify!.original_exploit}</span></td>
                      <td><span className={`badge ${b.verify!.legitimate_behavior === 'PASSED' ? 'badge-green' : 'badge-red'}`}>{b.verify!.legitimate_behavior}</span></td>
                      <td><span className={`badge ${b.verify!.overall_status.includes('REJECTED') ? 'badge-amber' : 'badge-green'}`}>{b.verify!.overall_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Manual vs Autonomous */}
      <section className="section" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Workflow Comparison</div>
            <h2>Manual vs Autonomous</h2>
            <p>The same security work — done without the coordination overhead.</p>
          </div>
          <div className="grid-2">
            {/* Traditional */}
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#f87171' }}>Traditional Workflow</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {['Developer', 'Security Tester', 'Developer', 'Security Reviewer', 'Developer', 'QA', 'Security Tester'].map((actor, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    {i > 0 && <div style={{ width: 2, height: 14, background: 'rgba(239,68,68,.2)', marginLeft: 20 }} />}
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 8, fontSize: '0.88rem', color: '#fca5a5', fontWeight: 500 }}>
                      {actor}
                      {i > 0 && i < 6 && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'rgba(239,68,68,.6)' }}>handoff</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {MANUAL_STEPS.map(s => (
                  <div key={s.step} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(239,68,68,.05)', borderRadius: 8 }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{s.step}</span>
                    <span className="badge badge-red">Manual</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Autonomous */}
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#4ade80' }}>Autonomous Workflow</h3>
              <div style={{ padding: '1.25rem', background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 12 }}>
                <div style={{ textAlign: 'center', fontWeight: 600, color: '#60a5fa', fontSize: '0.9rem', marginBottom: '1rem' }}>Developer</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  {['Recon', 'Red Team', 'Judge', 'Risk', 'Blue Team', 'Verification', 'Re-Attack'].map(a => (
                    <div key={a} style={{ padding: '0.4rem 0.75rem', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 6, fontSize: '0.8rem', color: '#4ade80', textAlign: 'center' }}>{a}</div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>→ Developer reviews &amp; approves</div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { step: 'Recon',                     label: 'Agent-assisted' },
                  { step: 'Finding validation',         label: 'Automated' },
                  { step: 'Risk assessment',            label: 'Automated' },
                  { step: 'Remediation generation',     label: 'Agent-assisted' },
                  { step: 'Regression generation',      label: 'Automated' },
                  { step: 'Verification',               label: 'Automated' },
                  { step: 'Re-testing',                 label: 'Automated' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(34,197,94,.05)', borderRadius: 8 }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{s.step}</span>
                    <span className="badge badge-green">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <h3 style={{ marginBottom: '1rem' }}>Key Differences</h3>
            <div className="grid-3">
              {[
                { title: 'Fewer Handoffs',        desc: 'The pipeline coordinates all seven stages without manual context switching between teams.' },
                { title: 'Evidence at Every Step', desc: 'Every agent decision is captured as a JSON artifact. The full chain is inspectable and reproducible.' },
                { title: 'Faster Feedback Loop',   desc: 'Vulnerabilities move from discovery to verified remediation in a single autonomous run.' },
              ].map(item => (
                <div key={item.title} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent2)' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.88rem' }}>{item.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 8, fontSize: '0.85rem', color: '#d97706' }}>
              ⚠️ These comparisons are qualitative. No unverified percentage claims are presented as facts.
            </div>
          </div>
        </div>
      </section>

      {/* Document Understanding */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">IBM Bob 2.0 Capabilities</div>
            <h2>Agents don't just inspect code. They understand context.</h2>
            <p>Project documentation feeds into the agent context, enabling targeted security testing.</p>
          </div>
          <div className="grid-2">
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Document Sources</h3>
              {['README.md', 'architecture.md', 'api.md', 'testing.md'].map(doc => (
                <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', marginBottom: '0.5rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <span style={{ color: '#60a5fa' }}>📄</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{doc}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Agent Context Pipeline</h3>
              {[
                'Project documentation',
                'Agent context',
                'Architecture understanding',
                'Attack surface discovery',
                'Targeted security testing',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  {i > 0 && <div style={{ width: 2, height: 12, background: 'var(--border2)', marginLeft: 16 }} />}
                  <div style={{ padding: '0.55rem 1rem', background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 8, fontSize: '0.85rem', color: '#c4b5fd' }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
