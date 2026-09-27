import { useState } from 'react'

type Page = 'overview' | 'pipeline' | 'findings' | 'evidence' | 'impact' | 'architecture'

interface Props {
  onNav: (p: Page) => void
}

const STEPS = [
  {
    label: 'Step 1 — The Problem',
    title: 'Security testing creates developer bottlenecks.',
    body: `Manual investigation, vulnerability reproduction, false-positive validation, risk assessment, remediation, regression testing — every step is a context switch. Every handoff is lost time.`,
    extra: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '2rem', maxWidth: 500 }}>
        {['Manual recon', 'Manual validation', 'Manual risk assessment', 'Manual remediation', 'Manual regression testing', 'Manual re-testing'].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8 }}>
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '1rem' }}>→</span>
            <span style={{ color: '#cbd5e1' }}>{s}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Step 2 — Traditional Workflow',
    title: 'Every step requires a human handoff.',
    body: `Developer → Security Tester → Developer → Reviewer → Developer → QA → Security Tester. Each handoff introduces delay, context loss, and rework.`,
    extra: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginTop: '2rem' }}>
        {['Developer', 'Security Tester', 'Developer', 'Reviewer', 'Developer', 'QA', 'Security Re-test'].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '0.5rem 1.4rem', background: 'rgba(100,116,139,.15)', border: '1px solid #2a3f5c', borderRadius: 8, color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>{s}</div>
            {i < 6 && <div style={{ width: 2, height: 16, background: '#2a3f5c', margin: '2px 0' }} />}
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Step 3 — Our Solution',
    title: 'What if the security loop could run itself?',
    body: `SecureBank replaces fragmented manual steps with an autonomous, evidence-backed feedback loop. Seven agents coordinate from discovery to verified remediation.`,
    extra: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginTop: '2rem' }}>
        {[
          { name: 'Recon', color: '#8b5cf6' },
          { name: 'Red Team', color: '#ef4444' },
          { name: 'Security Judge', color: '#f59e0b' },
          { name: 'Risk Analyzer', color: '#f59e0b' },
          { name: 'Blue Team', color: '#3b82f6' },
          { name: 'Verification', color: '#22c55e' },
          { name: 'Adaptive Re-Attack', color: '#06b6d4' },
        ].map((s, i, arr) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '0.5rem 1.4rem', background: `${s.color}18`, border: `1px solid ${s.color}44`, borderRadius: 8, color: s.color, fontSize: '0.9rem', fontWeight: 700, minWidth: 180, textAlign: 'center' }}>{s.name}</div>
            {i < arr.length - 1 && <div style={{ width: 2, height: 14, background: '#2a3f5c', margin: '2px 0' }} />}
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Step 4 — Agent Architecture',
    title: 'Seven agents. One coordinated loop.',
    body: `The Recon agent discovers attack surfaces. Red Team actively exploits them. Security Judge independently validates. Risk Analyzer prioritizes. Blue Team generates patches and regression tests. Verification confirms. Adaptive Red Team validates the defense boundary.`,
  },
  {
    label: 'Step 5 — Run Pipeline',
    title: 'One click launches the full autonomous loop.',
    body: `Navigate to Live Pipeline and click Run Security Pipeline. All seven agents execute in sequence, reading each other's outputs, and writing evidence artifacts at every step.`,
    cta: 'pipeline' as Page,
    ctaLabel: '▶ Go to Live Pipeline',
  },
  {
    label: 'Step 6 — Recon',
    title: 'Stage 1: Reconnaissance',
    body: `The Recon agent inspects the SecureBank application and discovers 5 attack surfaces: IDOR, SQL Injection, XSS, File Upload, and Privilege Escalation. Outputs recon_map.json.`,
    extra: (
      <div style={{ marginTop: '1.5rem', background: '#0d1117', border: '1px solid #1e2d45', borderRadius: 8, padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.82rem', color: '#a3e635' }}>
        {`5 endpoints discovered\n/api/users/2         → IDOR\n/api/transactions    → SQLi\n/api/transfers       → XSS\n/api/profile/upload  → FileUpload\n/api/admin/users     → PrivEsc`}
      </div>
    ),
  },
  {
    label: 'Step 7 — Red Team',
    title: 'Stage 2: Active Exploitation',
    body: `The Red Team engine executes targeted attack payloads against each discovered surface. All 5 vulnerabilities are confirmed as exploitable with real HTTP evidence.`,
    extra: (
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[
          { id: 'VULN-001', type: 'IDOR', sev: 'HIGH' },
          { id: 'VULN-002', type: 'SQL Injection', sev: 'CRITICAL' },
          { id: 'VULN-003', type: 'Stored XSS', sev: 'HIGH' },
          { id: 'VULN-004', type: 'File Upload', sev: 'HIGH' },
          { id: 'VULN-005', type: 'Privilege Escalation', sev: 'CRITICAL' },
        ].map(v => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8 }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>{v.id}</span>
            <span style={{ flex: 1, fontWeight: 600, color: '#e2e8f0' }}>{v.type}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', background: 'rgba(239,68,68,.15)', color: '#f87171', borderRadius: 20 }}>{v.sev}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Step 8 — Security Judge',
    title: 'Stage 3: Independent Validation',
    body: `The Security Judge independently reproduces each finding to eliminate false positives. All 5 findings are independently confirmed, each with a verification timestamp.`,
  },
  {
    label: 'Step 9 — Risk Analyzer',
    title: 'Stage 4: Prioritization',
    body: `The Risk Analyzer assigns risk scores, business impact, and remediation urgency. VULN-002 (SQLi) scores 9.8 — Emergency Patch. VULN-001 (IDOR) scores 8.5 — Immediate 24-48h.`,
  },
  {
    label: 'Step 10 — Blue Team',
    title: 'Stage 5: Autonomous Remediation',
    body: `The Blue Team agent identifies root causes, generates targeted code patches, and writes regression tests — one per vulnerability. No developer intervention required.`,
  },
  {
    label: 'Step 11 — Verification',
    title: 'Stage 6: Proof of Remediation',
    body: `The Verification engine re-runs the original exploit against the patched application. It checks that: the original exploit is blocked, legitimate behavior is preserved, and the regression test passes.`,
  },
  {
    label: 'Step 12 — Adaptive Re-Attack',
    title: 'Stage 7: Defense Boundary Validation',
    body: `The Adaptive Red Team tries alternative attack paths and bypass attempts. If the defense holds, the defense boundary is marked VALIDATED. If a new path is found, the loop continues.`,
  },
  {
    label: 'Step 13 — Evidence',
    title: 'Every decision leaves evidence.',
    body: `Every stage generates a JSON artifact. recon_map.json → VULN-001_finding.json → VULN-001_judge_result.json → VULN-001_risk_report.json → VULN-001_patch_result.json → verification_result.json`,
    cta: 'evidence' as Page,
    ctaLabel: 'View Evidence Chain',
  },
  {
    label: 'Step 14 — Before vs After',
    title: 'From Vulnerable to Verified.',
    body: `Before: unauthorized access succeeds. After: original attack blocked, legitimate behavior preserved, regression test passes, adaptive attack blocked. Measurable. Reproducible. Evidence-backed.`,
  },
  {
    label: 'Step 15 — Developer Impact',
    title: 'Less coordination. Faster feedback.',
    body: `The developer no longer coordinates seven separate manual activities. The autonomous loop runs end-to-end: discovery → attack → validation → prioritization → patching → verification → re-attack. The developer reviews and approves.`,
    cta: 'impact' as Page,
    ctaLabel: 'See Developer Impact',
  },
  {
    label: 'Step 16 — Final Result',
    title: 'One coordinated security feedback loop.',
    body: `From discovery to verified remediation. Fully autonomous. Evidence at every step. Developer remains in control. This is the SecureBank Autonomous DevSecOps pipeline — powered by IBM Bob 2.0 multi-agent architecture.`,
  },
]

export function DemoMode({ onExit, onNav }: Props & { onExit: () => void }) {
  const [step, setStep] = useState(0)

  const current = STEPS[step]
  const total = STEPS.length

  return (
    <div className="demo-overlay">
      <div className="demo-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>SecureBank Demo Mode</span>
        </div>
        <div className="demo-progress" style={{ fontSize: '0.9rem' }}>
          Step {step + 1} of {total}
        </div>
        <button className="btn btn-ghost" onClick={onExit}>✕ Exit</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#1e2d45' }}>
        <div style={{ height: '100%', background: '#3b82f6', width: `${((step + 1) / total) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      <div className="demo-content fade-in" key={step}>
        <div style={{ width: '100%', maxWidth: 820 }}>
          <div className="demo-step-label">{current.label}</div>
          <h1 className="demo-title">{current.title}</h1>
          <p className="demo-body">{current.body}</p>
          {current.extra && current.extra}
          {current.cta && (
            <button
              className="btn btn-primary btn-large"
              style={{ marginTop: '2rem' }}
              onClick={() => onNav(current.cta!)}
            >
              {current.ctaLabel}
            </button>
          )}
        </div>
      </div>

      <div className="demo-footer">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: i === step ? '#3b82f6' : i < step ? '#22c55e' : '#1e2d45',
                transition: 'background 0.2s',
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
        <div className="demo-nav">
          <button
            className="btn btn-secondary"
            disabled={step === 0}
            onClick={() => setStep(s => s - 1)}
          >
            ← Previous
          </button>
          {step < total - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-success" onClick={onExit}>
              ✓ Finish Demo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
