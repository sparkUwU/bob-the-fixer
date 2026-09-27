import type { PipelineStatus, VulnBundle, Metrics, ArtifactMeta, ArtifactDetail } from './types'

const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? `${res.status} ${res.statusText}`)
  }
  return res.json()
}

export const api = {
  health: () => get<{ ok: boolean; target_running: boolean }>('/health'),
  pipelineStatus: () => get<PipelineStatus>('/pipeline/status'),
  pipelineRun: () => post<{ ok: boolean; message: string }>('/pipeline/run'),
  findings: () => get<VulnBundle[]>('/findings'),
  finding: (id: string) => get<VulnBundle>(`/findings/${id}`),
  metrics: () => get<Metrics>('/metrics'),
  artifacts: () => get<ArtifactMeta[]>('/artifacts'),
  artifact: (id: string) => get<ArtifactDetail>(`/artifacts/${id}`),
}

export function formatRuntime(seconds: number | null): string {
  if (seconds === null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function severityColor(sev: string): string {
  switch (sev?.toLowerCase()) {
    case 'critical': return 'badge-red'
    case 'high':     return 'badge-red'
    case 'medium':   return 'badge-amber'
    case 'low':      return 'badge-blue'
    default:         return 'badge-muted'
  }
}

export function priorityColor(p: string): string {
  switch (p?.toUpperCase()) {
    case 'CRITICAL': return 'badge-red'
    case 'HIGH':     return 'badge-red'
    case 'MEDIUM':   return 'badge-amber'
    case 'LOW':      return 'badge-blue'
    default:         return 'badge-muted'
  }
}

export function statusColor(s: string): string {
  switch (s?.toUpperCase()) {
    case 'CONFIRMED': case 'PATCHED': case 'VERIFIED': return 'badge-green'
    case 'REJECTED': case 'FAILED':   return 'badge-red'
    case 'PENDING':                   return 'badge-amber'
    default:                          return 'badge-muted'
  }
}
