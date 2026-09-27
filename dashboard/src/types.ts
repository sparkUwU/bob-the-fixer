// ── Domain types ───────────────────────────────────────────────────────────

export interface Finding {
  id: string
  type: string
  endpoint: string
  http_method: string
  severity: string
  description: string
  reproduction: Record<string, unknown>
  evidence: Record<string, unknown>
  timestamp: string
}

export interface JudgeResult {
  vulnerability_id: string
  validation_status: string
  security_impact_verified: boolean
  reproduction_log: string
  reasoning: string
  validated_at: string
}

export interface RiskReport {
  vulnerability_id: string
  priority: string
  risk_score: number
  exploitability: string
  business_impact: string
  required_privilege: string
  remediation_urgency: string
}

export interface PatchResult {
  vulnerability_id: string
  root_cause: string
  files_changed: string[]
  fix_description: string
  regression_test_file: string
  status: string
}

export interface VerificationResult {
  vulnerability_id: string
  original_exploit: string
  regression_test: string
  legitimate_behavior: string
  overall_status: string
  verification_timestamp: string
}

export interface VulnBundle {
  id: string
  finding: Finding
  judge: JudgeResult | null
  risk: RiskReport | null
  patch: PatchResult | null
  verify: VerificationResult | null
}

export interface StageState {
  status: 'waiting' | 'running' | 'completed' | 'failed'
  started_at: string | null
  finished_at: string | null
}

export interface PipelineStatus {
  status: 'idle' | 'running' | 'completed' | 'failed'
  started_at: string | null
  finished_at: string | null
  error: string | null
  stages: {
    recon: StageState
    red_team: StageState
    judge: StageState
    risk: StageState
    blue_team: StageState
    verifier: StageState
    reattack: StageState
  }
  log: string[]
}

export interface Metrics {
  total_findings: number
  confirmed: number
  remediated: number
  regression_tests: number
  verification_checks: number
  runtime_seconds: number | null
  stages_total: number
}

export interface ArtifactMeta {
  id: string
  path: string
  exists: boolean
}

export interface ArtifactDetail {
  id: string
  type: 'json' | 'text'
  path: string
  content: unknown
}
