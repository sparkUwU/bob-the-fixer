import { useState } from 'react'

const AGENTS = [
  {
    key: 'recon',
    name: 'Recon Agent',
    icon: '🔍',
    color: '#8b5cf6',
    purpose: 'Map the application attack surface — routes, endpoints, HTTP methods, and vulnerability categories.',
    input: 'Target application URL + project documentation.',
    action: 'Inspects static routes, performs targeted endpoint discovery, categorizes each endpoint by vulnerability class.',
    output: 'recon_map.json — a structured map of all discoverable attack surfaces.',
    why: 'Automated recon eliminates the manual investigation phase and ensures no attack surface is missed.',
  },
  {
    key: 'red_team',
    name: 'Red Team',
    icon: '⚔️',
    color: '#ef4444',
    purpose: 'Actively exploit each discovered attack surface with targeted payloads and capture real HTTP evidence.',
    input: 'recon_map.json — discovered endpoints and categories.',
    action: 'Executes IDOR, SQLi, XSS, file upload, and privilege escalation attacks with real credentials.',
    output: 'VULN-XXX_finding.json files with request details, response evidence, and extracted data.',
    why: 'Real exploitation evidence proves a vulnerability is exploitable — not merely theoretical.',
  },
  {
    key: 'judge',
    name: 'Security Judge',
    icon: '⚖️',
    color: '#f59e0b',
    purpose: 'Independently reproduce each Red Team finding to confirm it is genuine, not a false positive.',
    input: 'Red Team finding files (VULN-XXX_finding.json).',
    action: 'Replays each attack independently, checks the response, and renders a CONFIRMED / REJECTED verdict.',
    output: 'VULN-XXX_judge_result.json with validation status and reasoning.',
    why: 'Eliminates false positives before costly remediation work begins. Saves developer rework.',
  },
  {
    key: 'risk',
    name: 'Risk Analyzer',
    icon: '📊',
    color: '#f59e0b',
    purpose: 'Assign structured risk scores, business impact, required privilege, and remediation urgency.',
    input: 'Confirmed finding files.',
    action: 'Evaluates exploitability, blast radius, required access level, and business criticality.',
    output: 'VULN-XXX_risk_report.json with priority, risk score (0–10), and urgency.',
    why: 'Not all vulnerabilities are equal. Risk prioritization ensures the most dangerous findings are addressed first.',
  },
  {
    key: 'blue_team',
    name: 'Blue Team',
    icon: '🛡️',
    color: '#3b82f6',
    purpose: 'Identify root cause, generate a targeted code patch, and write an automated regression test.',
    input: 'Risk-prioritized finding files.',
    action: 'Traces the vulnerability to its source file and controller, generates a patch, writes a regression test.',
    output: 'VULN-XXX_patch_result.json + test_regression_vuln-XXX.py',
    why: 'Removes the developer investigation burden. The fix is narrowed to the exact source location automatically.',
  },
  {
    key: 'verifier',
    name: 'Verification Engine',
    icon: '✅',
    color: '#22c55e',
    purpose: 'Confirm the patch is effective: original exploit blocked, legitimate behavior preserved, regression test passes.',
    input: 'Finding file + patch result.',
    action: 'Re-runs the original exploit, tests legitimate behavior, and executes the regression test against the patched app.',
    output: 'VULN-XXX_verification_result.json with PASSED / REJECTED status for each check.',
    why: 'Verification is what turns a patch into proof. Without it, the fix is unconfirmed.',
  },
  {
    key: 'reattack',
    name: 'Adaptive Re-Attack',
    icon: '🔄',
    color: '#06b6d4',
    purpose: 'Attempt alternative attack paths and bypass techniques against the patched application.',
    input: 'Vulnerability ID + original exploit details + patch information.',
    action: 'Generates and tests bypass payloads, alternative parameter names, encoding variations, and related attack vectors.',
    output: 'Adaptive re-attack results with defense boundary verdict: VALIDATED or NEW PATH DISCOVERED.',
    why: 'A basic patch may close one door while leaving another open. Adaptive re-attack validates the full defense surface.',
  },
]

export function ArchitecturePage() {
  const [selected, setSelected] = useState<string | null>(null)

  const selectedAgent = AGENTS.find(a => a.key === selected)

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Architecture</div>
          <h2>Seven-Agent Security Loop</h2>
          <p>Each agent is purpose-built for one responsibility in the security feedback loop. Click an agent to explore its role.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Agent list */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {AGENTS.map((agent, i) => (
                <div key={agent.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                  {i > 0 && <div style={{ width: 2, height: 12, background: 'var(--border2)', marginLeft: 28 }} />}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                      background: selected === agent.key ? `${agent.color}14` : 'var(--surface)',
                      border: `1px solid ${selected === agent.key ? agent.color + '60' : 'var(--border)'}`,
                      borderRadius: 10, cursor: 'pointer', width: '100%',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSelected(selected === agent.key ? null : agent.key)}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${agent.color}18`, border: `1px solid ${agent.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {agent.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: selected === agent.key ? agent.color : 'var(--text)' }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.15rem' }}>Stage {i + 1}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{selected === agent.key ? '▲' : '▼'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ position: 'sticky', top: 72 }}>
            {selectedAgent ? (
              <div className="detail-panel fade-in" style={{ borderColor: selectedAgent.color + '40' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${selectedAgent.color}18`, border: `1px solid ${selectedAgent.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    {selectedAgent.icon}
                  </div>
                  <div>
                    <h3 style={{ color: selectedAgent.color }}>{selectedAgent.name}</h3>
                  </div>
                </div>

                {[
                  { label: 'Purpose',         value: selectedAgent.purpose },
                  { label: 'Input',           value: selectedAgent.input },
                  { label: 'What It Does',    value: selectedAgent.action },
                  { label: 'Output',          value: selectedAgent.output },
                  { label: 'Why It Matters',  value: selectedAgent.why },
                ].map(field => (
                  <div className="detail-field" key={field.label}>
                    <div className="detail-field-label">{field.label}</div>
                    <div className="detail-field-value">{field.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>🤖</div>
                <div style={{ color: 'var(--muted)' }}>Select an agent to explore its role in the security loop</div>
              </div>
            )}
          </div>
        </div>

        {/* Parallel architecture */}
        <div style={{ marginTop: '4rem' }}>
          <div className="section-header">
            <div className="section-label">Parallel Agent Architecture</div>
            <h2>How the architecture scales</h2>
            <p>The pipeline is designed to support parallel subagent execution for concurrent attack surface coverage.</p>
          </div>
          <div style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ padding: '0.65rem 2rem', display: 'inline-block', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)', borderRadius: 8, fontWeight: 700, color: '#60a5fa', fontSize: '0.9rem' }}>
                SECURITY MISSION
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', gap: '4rem' }}>
              <div style={{ width: 2, height: 24, background: 'var(--border2)', marginLeft: -2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {['API Agent', 'Auth Agent', 'Config Agent'].map((agent, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.6rem 1.2rem', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.3)', borderRadius: 8, color: '#a78bfa', fontWeight: 600, fontSize: '0.85rem' }}>{agent}</div>
                  <div style={{ width: 2, height: 16, background: 'var(--border2)' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ padding: '0.65rem 2rem', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 8, fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem' }}>
                Security Judge
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 8, display: 'inline-block', fontSize: '0.82rem', color: '#d97706', margin: '0 auto' }}>
              ⚠️ Parallel execution is an architectural capability. The current pipeline runs sequentially per vulnerability.
            </div>
          </div>
        </div>

        {/* IBM Bob 2.0 */}
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(59,130,246,.08), rgba(139,92,246,.08))', border: '1px solid rgba(59,130,246,.25)', borderRadius: 12 }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Powered by IBM Bob 2.0</h3>
          <p style={{ marginBottom: '1.25rem' }}>This pipeline demonstrates IBM Bob 2.0 multi-agent orchestration capabilities:</p>
          <div className="grid-3">
            {[
              { title: 'Agent Workflow',      desc: 'Seven specialized agents coordinated in sequence, each consuming the previous agent\'s output.' },
              { title: 'Document Understanding', desc: 'Agents consume project documentation to build context-aware attack strategies.' },
              { title: 'Developer Integration', desc: 'The pipeline produces actionable findings that feed directly into the developer\'s workflow.' },
            ].map(item => (
              <div key={item.title} style={{ padding: '1rem', background: 'rgba(15,23,42,.5)', borderRadius: 8, border: '1px solid rgba(59,130,246,.2)' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#60a5fa' }}>{item.title}</h4>
                <p style={{ fontSize: '0.85rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
