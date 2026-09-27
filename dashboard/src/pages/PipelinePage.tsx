import { useState, useEffect, useRef } from 'react'
import { api, formatRuntime } from '../api'
import type { PipelineStatus } from '../types'

const STAGE_META: Record<string, { label: string; desc: string; color: string; icon: string }> = {
  recon:     { label: 'Recon Agent',          desc: 'Discovering application attack surface',       color: '#8b5cf6', icon: '🔍' },
  red_team:  { label: 'Red Team',             desc: 'Testing discovered attack surfaces',           color: '#ef4444', icon: '⚔️' },
  judge:     { label: 'Security Judge',       desc: 'Independently validating findings',            color: '#f59e0b', icon: '⚖️' },
  risk:      { label: 'Risk Analyzer',        desc: 'Assessing severity and business impact',       color: '#f59e0b', icon: '📊' },
  blue_team: { label: 'Blue Team',            desc: 'Generating patches and regression tests',      color: '#3b82f6', icon: '🛡️' },
  verifier:  { label: 'Verification Engine',  desc: 'Confirming fix effectiveness',                 color: '#22c55e', icon: '✅' },
  reattack:  { label: 'Adaptive Re-Attack',   desc: 'Validating defense boundary',                  color: '#06b6d4', icon: '🔄' },
}

const STAGE_ORDER = ['recon', 'red_team', 'judge', 'risk', 'blue_team', 'verifier', 'reattack']

const STAGE_DETAILS: Record<string, { objective: string; input: string; output: string; why: string }> = {
  recon: {
    objective: 'Map the application attack surface — routes, endpoints, HTTP methods, and categorized vulnerability classes.',
    input: 'Target application at http://127.0.0.1:3000 + project documentation.',
    output: 'red_team/reports/recon_map.json',
    why: 'Without reconnaissance, the pipeline cannot know which surfaces to test. Automated recon removes the manual investigation phase entirely.',
  },
  red_team: {
    objective: 'Actively exploit each discovered attack surface with targeted payloads and capture real evidence.',
    input: 'recon_map.json — discovered endpoints and categories.',
    output: 'VULN-001 through VULN-005 finding JSON files with HTTP evidence.',
    why: 'Real exploitation evidence is required to prove a vulnerability is exploitable, not merely present.',
  },
  judge: {
    objective: 'Independently reproduce each finding to confirm it is a genuine security vulnerability, not a false positive.',
    input: 'Red Team finding files.',
    output: 'VULN-XXX_judge_result.json with CONFIRMED / REJECTED status.',
    why: 'Eliminates false positives before remediation work begins. Saves developer rework.',
  },
  risk: {
    objective: 'Assign risk scores, exploitability, business impact, required privilege, and remediation urgency.',
    input: 'Confirmed finding files.',
    output: 'VULN-XXX_risk_report.json with priority and risk score.',
    why: 'Not all vulnerabilities are equal. Risk prioritization ensures the most dangerous findings are addressed first.',
  },
  blue_team: {
    objective: 'Identify root cause, generate a targeted code patch, and write an automated regression test.',
    input: 'Risk-prioritized finding files.',
    output: 'VULN-XXX_patch_result.json + test_regression_vuln-XXX.py',
    why: 'Removes the developer investigation burden. The patch agent narrows the fix to the exact source location.',
  },
  verifier: {
    objective: 'Confirm the patch is effective: original exploit is blocked, legitimate behavior passes, regression test passes.',
    input: 'Finding file + patch result.',
    output: 'VULN-XXX_verification_result.json with PASSED / REJECTED status.',
    why: 'Verification is what turns a patch into proof. Without it, the fix is unconfirmed.',
  },
  reattack: {
    objective: 'Attempt alternative attack paths and bypass techniques against the patched application.',
    input: 'Vulnerability ID + original exploit details.',
    output: 'Adaptive re-attack results with defense boundary verdict.',
    why: 'A basic patch may close one door while leaving another open. Adaptive re-attack validates the full defense surface.',
  },
}

function elapsed(start: string | null, end: string | null): string {
  if (!start) return ''
  const t0 = new Date(start).getTime()
  const t1 = end ? new Date(end).getTime() : Date.now()
  const s = Math.round((t1 - t0) / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function PipelinePage() {
  const [status, setStatus] = useState<PipelineStatus | null>(null)
  const [targetRunning, setTargetRunning] = useState<boolean | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])
  const logRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    checkHealth()
    fetchStatus()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  function checkHealth() {
    api.health().then(h => setTargetRunning(h.target_running)).catch(() => setTargetRunning(false))
  }

  function fetchStatus() {
    api.pipelineStatus().then(s => {
      setStatus(s)
      setLog(s.log)
    }).catch(() => {})
  }

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      fetchStatus()
    }, 1500)
  }

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  useEffect(() => {
    if (status?.status === 'running') {
      startPolling()
    } else {
      stopPolling()
    }
  }, [status?.status])

  async function handleRun() {
    setRunError(null)
    try {
      await api.pipelineRun()
      startPolling()
    } catch (e: unknown) {
      setRunError(e instanceof Error ? e.message : String(e))
    }
  }

  const stageKey = (key: string) => {
    return (status?.stages as Record<string, { status: string; started_at: string | null; finished_at: string | null }>)?.[key]
  }

  const completedStages = STAGE_ORDER.filter(k => stageKey(k)?.status === 'completed').length

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-label">Live Pipeline</div>
            <h2>Autonomous Security Control Center</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Target status */}
            <div className="status-row">
              <div className={`dot ${targetRunning === true ? 'dot-green' : targetRunning === false ? 'dot-red' : 'dot-muted'}`} />
              <span className="label">Target:</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem' }}>http://127.0.0.1:3000</span>
              <span className={`badge ${targetRunning === true ? 'badge-green' : targetRunning === false ? 'badge-red' : 'badge-muted'}`}>
                {targetRunning === true ? 'Running' : targetRunning === false ? 'Offline' : '...'}
              </span>
            </div>
          </div>
        </div>

        {/* Error alert */}
        {runError && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <span>⚠️</span>
            <span>{runError}</span>
          </div>
        )}
        {targetRunning === false && (
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            <span>⚠️</span>
            <div>
              <strong>SecureBank is not running.</strong>
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#d97706' }}>
                Start the target application at http://127.0.0.1:3000 (run <code>npm run dev</code> inside target_app)
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: stages + log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Run button + pipeline status */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Pipeline Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className={`dot ${status?.status === 'completed' ? 'dot-green' : status?.status === 'running' ? 'dot-amber' : status?.status === 'failed' ? 'dot-red' : 'dot-muted'}`} />
                  <span style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {status?.status ?? 'IDLE'}
                  </span>
                  {status?.status === 'running' && status.started_at && (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--amber)' }}>
                      {elapsed(status.started_at, null)}
                    </span>
                  )}
                  {status?.status === 'completed' && status.started_at && status.finished_at && (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--green)' }}>
                      {elapsed(status.started_at, status.finished_at)}
                    </span>
                  )}
                </div>
                {status?.status === 'completed' && (
                  <div style={{ marginTop: '0.25rem', fontSize: '0.82rem', color: 'var(--green)' }}>
                    {completedStages} / {STAGE_ORDER.length} stages completed
                  </div>
                )}
              </div>
              <button
                className={`btn btn-large ${status?.status === 'running' ? 'btn-secondary' : 'btn-primary'}`}
                disabled={status?.status === 'running'}
                onClick={handleRun}
              >
                {status?.status === 'running' ? (
                  <><span className="spin" style={{ display: 'inline-block' }}>⟳</span> Running…</>
                ) : '▶ Run Security Pipeline'}
              </button>
            </div>

            {/* Stage list */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Pipeline Stages</h3>
              <div className="stage-list">
                {STAGE_ORDER.map((key, idx) => {
                  const s = stageKey(key)
                  const meta = STAGE_META[key]
                  const stateStatus = s?.status ?? 'waiting'
                  return (
                    <div
                      key={key}
                      className={`stage-item${selectedStage === key ? ' active' : ''}`}
                      onClick={() => setSelectedStage(selectedStage === key ? null : key)}
                    >
                      <div className={`stage-number ${stateStatus === 'completed' ? 'done' : stateStatus === 'running' ? 'running' : ''}`}>
                        {stateStatus === 'completed' ? '✓' : stateStatus === 'running' ? '●' : idx + 1}
                      </div>
                      <div className="stage-info">
                        <div className="stage-name" style={{ color: meta.color }}>
                          {meta.icon} {meta.label}
                        </div>
                        <div className="stage-desc">{meta.desc}</div>
                      </div>
                      <div>
                        {stateStatus === 'waiting' && <span className="badge badge-muted">Waiting</span>}
                        {stateStatus === 'running' && <span className="badge badge-amber">Running</span>}
                        {stateStatus === 'completed' && <span className="badge badge-green">Done</span>}
                        {stateStatus === 'failed' && <span className="badge badge-red">Failed</span>}
                      </div>
                      {s?.started_at && (
                        <div className="stage-time">{elapsed(s.started_at, s.finished_at ?? null)}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Log */}
            {log.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '0.75rem' }}>Execution Log</h3>
                <div className="log-container" ref={logRef}>
                  {log.map((line, i) => {
                    const cls = line.includes('STAGE') ? 'log-stage' : line.startsWith('[!]') ? 'log-error' : line.includes('✓') || line.includes('[+]') ? 'log-success' : ''
                    return <div key={i} className={`log-line ${cls}`}>{line}</div>
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: stage detail panel */}
          <div>
            {selectedStage ? (
              <div className="detail-panel fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{STAGE_META[selectedStage].icon}</span>
                  <h3 style={{ color: STAGE_META[selectedStage].color }}>{STAGE_META[selectedStage].label}</h3>
                </div>
                {(['objective', 'input', 'output', 'why'] as const).map(field => (
                  <div className="detail-field" key={field}>
                    <div className="detail-field-label">{field === 'why' ? 'Why It Matters' : field.charAt(0).toUpperCase() + field.slice(1)}</div>
                    <div className="detail-field-value">{STAGE_DETAILS[selectedStage][field]}</div>
                  </div>
                ))}
                {/* Stage status detail */}
                {stageKey(selectedStage) && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div className="detail-field-label">Execution Status</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {stageKey(selectedStage)?.started_at && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                          Started: {new Date(stageKey(selectedStage)!.started_at!).toLocaleTimeString()}
                        </div>
                      )}
                      {stageKey(selectedStage)?.finished_at && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--green)', fontFamily: 'var(--mono)' }}>
                          Finished: {new Date(stageKey(selectedStage)!.finished_at!).toLocaleTimeString()}
                          {' '}({elapsed(stageKey(selectedStage)!.started_at, stageKey(selectedStage)!.finished_at)})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.4 }}>👆</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Click a stage to view details</div>
              </div>
            )}

            {/* Final result after completion */}
            {status?.status === 'completed' && (
              <div className="card" style={{ marginTop: '1rem', borderColor: 'rgba(34,197,94,.4)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>✅</div>
                  <h3 style={{ color: 'var(--green)', marginTop: '0.5rem' }}>Security Loop Complete</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    ['Target', 'SecureBank'],
                    ['Pipeline', 'COMPLETE'],
                    ['Stages', `${completedStages} / 7`],
                    ['Runtime', formatRuntime(
                      status.started_at && status.finished_at
                        ? Math.round((new Date(status.finished_at).getTime() - new Date(status.started_at).getTime()) / 1000)
                        : null
                    )],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--muted)' }}>{k}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8 }}>
                    <div style={{ fontSize: '1.2rem' }}>🔴</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', marginTop: '0.25rem' }}>BEFORE</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Vulnerable</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)' }}>→</div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 8 }}>
                    <div style={{ fontSize: '1.2rem' }}>🟢</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', marginTop: '0.25rem' }}>AFTER</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Verified</div>
                  </div>
                </div>
              </div>
            )}

            {status?.status === 'failed' && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                <span>⚠️</span>
                <div>
                  <strong>Pipeline execution failed.</strong>
                  {status.error && <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>{status.error}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
