type Page = 'overview' | 'pipeline' | 'findings' | 'evidence' | 'impact' | 'architecture'

interface Props {
  onNav: (page: Page) => void
}

const PROBLEM_STEPS = [
  'Manual Recon', 'Security Testing', 'Investigate Finding',
  'Validate Vulnerability', 'Assess Risk', 'Find Fix',
  'Write Regression Test', 'Verify Fix', 'Re-test'
]

const FRICTION_LABELS = [
  { label: 'Context switching',      col: '#ef4444' },
  { label: 'Manual handoffs',        col: '#f59e0b' },
  { label: 'Repeated work',          col: '#ef4444' },
  { label: 'False positives',        col: '#f59e0b' },
  { label: 'Long feedback cycles',   col: '#ef4444' },
  { label: 'Human error',            col: '#f59e0b' },
]

const STAGES = [
  { name: 'Recon',            color: '#8b5cf6', desc: 'Discovers attack surfaces' },
  { name: 'Red Team',         color: '#ef4444', desc: 'Actively exploits surfaces' },
  { name: 'Security Judge',   color: '#f59e0b', desc: 'Independently validates' },
  { name: 'Risk Analyzer',    color: '#f59e0b', desc: 'Prioritizes by impact' },
  { name: 'Blue Team',        color: '#3b82f6', desc: 'Patches & regression tests' },
  { name: 'Verification',     color: '#22c55e', desc: 'Confirms fix is effective' },
  { name: 'Adaptive Re-Attack', color: '#06b6d4', desc: 'Validates defense boundary' },
]

export function OverviewPage({ onNav }: Props) {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            IBM Bob 2.0 · Autonomous DevSecOps
          </div>
          <h1>Security testing shouldn't become another developer bottleneck.</h1>
          <p className="hero-sub">
            Modern applications change faster than manual security workflows can keep up.
            Developers investigate findings, validate vulnerabilities, coordinate remediation,
            write regression tests, and verify fixes — repeatedly.
            <br /><br />
            <strong style={{ color: '#e2e8f0' }}>SecureBank turns that fragmented workflow into an autonomous security feedback loop.</strong>
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={() => onNav('pipeline')}>
              ▶ Run Security Pipeline
            </button>
            <button className="btn btn-secondary btn-large" onClick={() => onNav('architecture')}>
              Explore How It Works
            </button>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">The Problem</div>
            <h2>The traditional security workflow</h2>
            <p>Every step is a manual task. Every task is a context switch. Security becomes a bottleneck.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* Flow */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                <div style={{ padding: '0.6rem 1.2rem', background: 'rgba(100,116,139,.12)', border: '1px solid var(--border2)', borderRadius: 8, fontWeight: 600, color: '#e2e8f0' }}>Developer</div>
                {PROBLEM_STEPS.map((step, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ width: 2, height: 14, background: 'var(--border2)', marginLeft: 20 }} />
                    <div style={{ padding: '0.55rem 1.2rem', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, color: '#fca5a5', fontSize: '0.88rem', fontWeight: 500 }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Friction labels */}
            <div>
              <h3 style={{ marginBottom: '1.25rem', color: '#94a3b8' }}>Why this is expensive</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {FRICTION_LABELS.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: `${f.col}0d`, border: `1px solid ${f.col}30`, borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.col, flexShrink: 0 }} />
                    <span style={{ fontWeight: 500, color: '#cbd5e1' }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="section" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(59,130,246,.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-label">The Solution</div>
            <h2>What if the security loop could run itself?</h2>
            <p style={{ maxWidth: 560, margin: '0.5rem auto 0' }}>Seven specialized agents coordinate end-to-end. Each reads the previous output and writes evidence for the next.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            {STAGES.map((stage, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  padding: '0.65rem 2rem', minWidth: 220, textAlign: 'center',
                  background: `${stage.color}14`,
                  border: `1px solid ${stage.color}44`,
                  borderRadius: 10,
                  color: stage.color, fontWeight: 700, fontSize: '0.95rem',
                }}>
                  <div>{stage.name}</div>
                  <div style={{ fontWeight: 400, fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>{stage.desc}</div>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 2, height: 18, background: 'var(--border2)' }} />
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>↓</div>
                    <div style={{ width: 2, height: 4, background: 'var(--border2)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button className="btn btn-primary btn-large" onClick={() => onNav('pipeline')}>
              ▶ Run Security Pipeline
            </button>
          </div>
        </div>
      </section>

      {/* HUMAN CONTROL */}
      <section className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <div className="section-label">Developer Control</div>
              <h2>AI accelerates the workflow. Developers remain in control.</h2>
              <p style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                The system doesn't remove developers from the security process. It removes the repetitive coordination work — leaving developers to focus on review and approval.
              </p>
              <button className="btn btn-secondary" onClick={() => onNav('impact')}>
                See Developer Impact →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
              {[
                { actor: 'AI', action: 'Discovers attack surfaces' },
                { actor: 'AI', action: 'Validates vulnerabilities' },
                { actor: 'AI', action: 'Analyzes risk' },
                { actor: 'AI', action: 'Proposes remediation' },
                { actor: '👤', action: 'Developer reviews' },
                { actor: '👤', action: 'Developer approves' },
                { actor: 'AI', action: 'Verification confirms' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  {i > 0 && <div style={{ width: 2, height: 12, background: 'var(--border2)', marginLeft: 20 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', background: row.actor === '👤' ? 'rgba(59,130,246,.08)' : 'rgba(139,92,246,.08)', border: `1px solid ${row.actor === '👤' ? 'rgba(59,130,246,.25)' : 'rgba(139,92,246,.2)'}`, borderRadius: 8 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: row.actor === '👤' ? '#60a5fa' : '#a78bfa', minWidth: 28 }}>{row.actor}</span>
                    <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>{row.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="section-sm" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3>Ready to see it live?</h3>
            <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Launch the autonomous pipeline and watch all seven stages execute in real time.</p>
          </div>
          <button className="btn btn-primary btn-large" onClick={() => onNav('pipeline')}>
            ▶ Go to Live Pipeline
          </button>
        </div>
      </section>
    </>
  )
}
