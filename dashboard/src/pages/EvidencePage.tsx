import { useState, useEffect } from 'react'
import { api } from '../api'
import type { ArtifactMeta, ArtifactDetail } from '../types'

const CHAIN_ITEMS = [
  { agent: 'Recon Agent',       artifactId: 'recon_map',       label: 'recon_map.json',                  color: '#8b5cf6', icon: '🔍' },
  { agent: 'Red Team',          artifactId: 'VULN-001_finding', label: 'VULN-001_finding.json',           color: '#ef4444', icon: '⚔️' },
  { agent: 'Security Judge',    artifactId: 'VULN-001_judge',   label: 'VULN-001_judge_result.json',      color: '#f59e0b', icon: '⚖️' },
  { agent: 'Risk Analyzer',     artifactId: 'VULN-001_risk',    label: 'VULN-001_risk_report.json',       color: '#f59e0b', icon: '📊' },
  { agent: 'Blue Team',         artifactId: 'VULN-001_patch',   label: 'VULN-001_patch_result.json',      color: '#3b82f6', icon: '🛡️' },
  { agent: 'Blue Team (Test)',   artifactId: 'test_vuln-001',    label: 'test_regression_vuln-001.py',     color: '#3b82f6', icon: '🧪' },
  { agent: 'Verification',      artifactId: 'VULN-001_verify',  label: 'VULN-001_verification_result.json', color: '#22c55e', icon: '✅' },
]

function ArtifactViewer({ detail, onClose }: { detail: ArtifactDetail; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const content = detail.type === 'json'
    ? JSON.stringify(detail.content, null, 2)
    : String(detail.content)

  function copy() {
    navigator.clipboard.writeText(content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="artifact-viewer fade-in">
      <div className="artifact-header">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: detail.type === 'json' ? '#06b6d4' : '#a78bfa' }}>{detail.type.toUpperCase()}</span>
          <span>{detail.path}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }} onClick={copy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }} onClick={onClose}>
            ✕
          </button>
        </div>
      </div>
      <div className="artifact-body">
        <pre>{content}</pre>
      </div>
    </div>
  )
}

export function EvidencePage() {
  const [artifactMeta, setArtifactMeta] = useState<ArtifactMeta[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [detail, setDetail] = useState<ArtifactDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.artifacts().then(a => setArtifactMeta(a)).catch(() => {})
  }, [])

  async function loadArtifact(id: string) {
    if (selected === id) { setSelected(null); setDetail(null); return }
    setSelected(id)
    setLoading(true)
    try {
      const d = await api.artifact(id)
      setDetail(d)
    } catch {
      setDetail(null)
    }
    setLoading(false)
  }

  function metaFor(id: string) {
    return artifactMeta.find(m => m.id === id)
  }

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Evidence</div>
          <h2>Every decision leaves evidence.</h2>
          <p>Each stage in the pipeline generates a verifiable artifact. Click any artifact to inspect its content.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Evidence chain */}
          <div>
            <h3 style={{ marginBottom: '1.25rem' }}>Evidence Chain — VULN-001</h3>
            <div className="evidence-chain">
              {CHAIN_ITEMS.map((item, i) => {
                const meta = metaFor(item.artifactId)
                const exists = meta?.exists ?? false
                return (
                  <div key={item.artifactId} style={{ width: '100%' }}>
                    {i > 0 && <div className="evidence-connector" />}
                    <div
                      className={`evidence-node${selected === item.artifactId ? ' active' : ''}`}
                      style={{ borderColor: selected === item.artifactId ? item.color : undefined }}
                      onClick={() => loadArtifact(item.artifactId)}
                    >
                      <div className="evidence-icon" style={{ background: `${item.color}18`, border: `1px solid ${item.color}40` }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.15rem' }}>{item.agent}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: item.color }}>{item.label}</div>
                      </div>
                      <span className={`badge ${exists ? 'badge-green' : 'badge-muted'}`}>
                        {exists ? 'Available' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Artifact viewer */}
          <div style={{ position: 'sticky', top: 72 }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Artifact Inspector</h3>
            {loading && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="spin" style={{ display: 'inline-block', fontSize: '1.5rem' }}>⟳</span>
              </div>
            )}
            {!loading && detail && (
              <ArtifactViewer detail={detail} onClose={() => { setSelected(null); setDetail(null) }} />
            )}
            {!loading && !detail && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', opacity: 0.4, marginBottom: '0.75rem' }}>📄</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Select an artifact to inspect its contents</div>
              </div>
            )}
          </div>
        </div>

        {/* Full artifact explorer */}
        <div style={{ marginTop: '4rem' }}>
          <div className="section-header">
            <h3>All Artifacts</h3>
            <p>Complete allowlisted artifact list from the pipeline.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {artifactMeta.map(a => (
              <div
                key={a.id}
                className="card-sm"
                style={{ cursor: 'pointer', borderColor: selected === a.id ? 'var(--accent)' : undefined, transition: 'border-color 0.15s' }}
                onClick={() => loadArtifact(a.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: '#60a5fa', wordBreak: 'break-all' }}>
                    {a.path.split(/[/\\]/).pop()}
                  </div>
                  <span className={`badge ${a.exists ? 'badge-green' : 'badge-muted'}`} style={{ flexShrink: 0 }}>
                    {a.exists ? '✓' : '○'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{a.path}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
