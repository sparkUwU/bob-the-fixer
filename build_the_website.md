# Build the SecureBank Autonomous DevSecOps Demonstration Website

You are working on our IBM BOB 2.0 hackathon project.

The project already contains a working/local **SecureBank vulnerable application** and an **Adversarial DevSecOps pipeline**.

Your task is to build a polished, attractive, interactive website that becomes the **main demonstration interface** for this project.

The website must clearly communicate:

> **A security workflow that normally requires multiple disconnected manual activities can instead become a continuous, evidence-backed developer feedback loop.**

The website must not merely be a dashboard.

It must tell a story:

```text
THE PROBLEM
     ↓
WHY THE CURRENT WORKFLOW IS EXPENSIVE
     ↓
OUR SOLUTION
     ↓
HOW THE AGENTS WORK TOGETHER
     ↓
LIVE PIPELINE EXECUTION
     ↓
SECURITY EVIDENCE
     ↓
REMEDIATION
     ↓
VERIFICATION
     ↓
ADAPTIVE RE-ATTACK
     ↓
MEASURABLE IMPACT
```

---

# 1. IMPORTANT: INSPECT BEFORE BUILDING

Before writing significant code, inspect the existing repository.

Find and understand:

```text
target_app/
pipeline_runner.py
red_team/
security_judge/
risk_analyzer/
blue_team/
verifier/
```

Specifically inspect:

* `pipeline_runner.py`
* existing pipeline stages
* existing JSON reports
* report schemas
* existing APIs
* target application endpoints
* generated patch artifacts
* generated regression tests
* verification artifacts
* timestamps/status information

Do not assume the report formats.

Use the actual files in the repository.

Do not create fake pipeline data if real data exists.

Do not duplicate the existing pipeline logic.

The website should become a visualization/control layer around the existing implementation.

---

# 2. EXISTING PIPELINE

The existing workflow is:

```text
Stage 1
Recon Agent
       ↓
Stage 2
Red Team Attack Engine
       ↓
Stage 3
Security Judge
       ↓
Stage 4
Risk Analyzer
       ↓
Stage 5
Blue Team Patch Agent
       ↓
Stage 6
Verification Engine
       ↓
Stage 7
Adaptive Red Team Re-Attack
```

Target application:

```text
http://127.0.0.1:3000
```

Existing execution:

```bash
python pipeline_runner.py
```

The website must represent this actual workflow.

---

# 3. PRIMARY GOAL

Build a website that a hackathon judge can understand within approximately 30 seconds.

When the judge opens the website, they should immediately understand:

### Problem

Security testing involves:

* manual investigation
* vulnerability reproduction
* false-positive validation
* risk assessment
* remediation
* regression testing
* repeated verification
* re-testing

This creates:

* time overhead
* context switching
* developer rework
* security bottlenecks
* inconsistent validation

### Solution

Our system connects these activities into one autonomous loop:

```text
Discover
   ↓
Attack
   ↓
Validate
   ↓
Prioritize
   ↓
Remediate
   ↓
Verify
   ↓
Re-Attack
```

### Result

The developer gets an evidence-backed security feedback loop instead of coordinating every step manually.

---

# 4. WEBSITE STRUCTURE

Create the following main sections/pages:

```text
Overview
Live Pipeline
Findings
Evidence
Impact
Architecture
Demo Mode
```

Use a clean navigation system.

Avoid excessive menus.

---

# 5. LANDING PAGE

The landing page should start with a strong problem statement.

## Hero

Use a headline similar to:

> **Security testing shouldn't become another developer bottleneck.**

Supporting text:

> Modern applications change faster than manual security workflows can keep up. Developers must investigate findings, validate vulnerabilities, coordinate remediation, write regression tests, and verify fixes repeatedly.

Then introduce the solution:

> **SecureBank turns that fragmented workflow into an autonomous security feedback loop.**

Primary button:

```text
▶ Run Security Pipeline
```

Secondary button:

```text
Explore How It Works
```

---

# 6. SHOW THE CURRENT PROBLEM

Create a visual section:

# "The traditional security workflow"

Show:

```text
Developer
    ↓
Manual Recon
    ↓
Security Testing
    ↓
Investigate Finding
    ↓
Validate Vulnerability
    ↓
Assess Risk
    ↓
Find Fix
    ↓
Write Regression Test
    ↓
Verify Fix
    ↓
Re-test
```

Make the friction visible.

Use labels such as:

```text
Context switching
Manual handoffs
Repeated work
False positives
Long feedback cycles
Human error
```

Do not invent numerical claims.

---

# 7. TRANSITION TO THE SOLUTION

Create a strong visual transition.

Heading:

# "What if the security loop could run itself?"

Show:

```text
┌──────────────┐
│   RECON      │
└──────┬───────┘
       ↓
┌──────────────┐
│  RED TEAM    │
└──────┬───────┘
       ↓
┌──────────────┐
│ SECURITY     │
│ JUDGE        │
└──────┬───────┘
       ↓
┌──────────────┐
│ RISK         │
│ ANALYZER     │
└──────┬───────┘
       ↓
┌──────────────┐
│ BLUE TEAM    │
└──────┬───────┘
       ↓
┌──────────────┐
│ VERIFICATION │
└──────┬───────┘
       ↓
┌──────────────┐
│ ADAPTIVE     │
│ RE-ATTACK    │
└──────────────┘
```

Animate the flow subtly.

Do not use excessive hacker/matrix effects.

---

# 8. AGENT ARCHITECTURE

Create an interactive section explaining the agents.

Show:

```text
                    SECURITY MISSION
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
       Recon            Red Team        Document
       Agent             Agent          Understanding
          │                │                │
          └────────────────┼────────────────┘
                           ↓
                    Security Judge
                           ↓
                     Risk Analyzer
                           ↓
                      Blue Team
                           ↓
                     Verification
                           ↓
                  Adaptive Red Team
```

Each agent should be clickable.

When clicked, display:

* Agent purpose
* Input
* What it does
* Output
* Why it matters

---

# 9. LIVE PIPELINE PAGE

Create:

# "Autonomous Security Control Center"

Show:

```text
Target
SecureBank

Target URL
http://127.0.0.1:3000

Pipeline Status
READY
```

Add a prominent:

```text
▶ RUN SECURITY PIPELINE
```

button.

---

# 10. PIPELINE EXECUTION

When the user clicks Run:

The website should invoke the existing pipeline safely.

Preferred architecture:

```text
Browser
   ↓
Dashboard Backend
   ↓
Allowlisted pipeline execution
   ↓
pipeline_runner.py
   ↓
Existing agents
```

Never expose arbitrary shell execution to the browser.

Do not allow the browser to submit arbitrary commands.

Only support controlled operations such as:

```text
RUN_PIPELINE
GET_STATUS
GET_STAGE
GET_FINDINGS
GET_ARTIFACT
```

---

# 11. LIVE STAGE VISUALIZATION

During execution, show all seven stages.

Example:

```text
✓ Recon Agent
  Discovering application attack surface

✓ Red Team
  Testing discovered attack surfaces

● Security Judge
  Independently validating findings

○ Risk Analyzer
  Waiting

○ Blue Team
  Waiting

○ Verification
  Waiting

○ Adaptive Re-Attack
  Waiting
```

Each stage must visually transition:

```text
WAITING
   ↓
RUNNING
   ↓
COMPLETED
```

or:

```text
FAILED
```

Display elapsed time.

---

# 12. STAGE DETAILS

Clicking a stage opens a detail panel.

## Recon

Display:

```text
Objective
Discover attack surface.

Input
Target application + project documentation.

Output
Route map / recon_map.json
```

If the real report contains:

* routes
* endpoints
* attack surfaces
* timestamps

show those actual values.

---

## Red Team

Display:

```text
Objective
Actively test discovered attack surfaces.

Findings
VULN-001
VULN-002
```

Show actual findings from the repository.

---

## Security Judge

Display:

```text
Objective
Independently reproduce findings.

Confirmed
X

Rejected
Y

False positives
Z
```

Use actual report data.

---

## Risk Analyzer

Display:

```text
Risk
Severity
Blast radius
Priority
```

Use actual generated risk reports.

---

## Blue Team

Display:

```text
Root cause
Affected file
Remediation
Regression test
```

Use the actual patch artifact.

---

## Verification

Display:

```text
Original exploit
BLOCKED ✓

Legitimate request
PASS ✓

Regression
PASS ✓
```

Use actual verification data.

---

## Adaptive Re-Attack

Display:

```text
Original attack
BLOCKED ✓

Alternative attack
BLOCKED ✓

Defense boundary
VALIDATED ✓
```

Again, use actual results.

---

# 13. FINDINGS PAGE

Create:

# "Security Findings"

Display each vulnerability as a clean card.

Example:

```text
VULN-001

Broken Object-Level Authorization

Severity
HIGH

Status
VERIFIED

Lifecycle
Detected
   ↓
Confirmed
   ↓
Prioritized
   ↓
Remediated
   ↓
Verified
   ↓
Re-tested
```

Do not hardcode these values if actual artifacts exist.

---

# 14. FINDING DETAILS

Clicking a vulnerability should open its complete lifecycle.

Show:

## Discovery

```text
Attack surface
Endpoint
Method
Discovery timestamp
```

## Red Team

Show the relevant attack request/evidence.

## Security Judge

Show:

```text
Reproduction
CONFIRMED
```

## Risk Analyzer

Show:

```text
Severity
Risk score
Impact
Priority
```

## Blue Team

Show:

```text
Root cause
Affected source file
Remediation
Generated regression test
```

## Verification

Show:

```text
Exploit
BLOCKED

Legitimate behavior
PASS
```

## Adaptive Re-Attack

Show:

```text
Bypass attempt
BLOCKED
```

This should visually demonstrate the full lifecycle of one vulnerability.

---

# 15. EVIDENCE CHAIN

This is a major part of the demo.

Create a section:

# "Every decision leaves evidence"

Show the artifact chain:

```text
Recon
 ↓
recon_map.json
 ↓
Red Team
 ↓
VULN-001_finding.json
 ↓
Security Judge
 ↓
VULN-001_judge_result.json
 ↓
Risk Analyzer
 ↓
VULN-001_risk_report.json
 ↓
Blue Team
 ↓
VULN-001_patch_result.json
 ↓
Regression Test
 ↓
test_regression_vuln-001.py
 ↓
Verification
 ↓
VULN-001_verification_result.json
```

Make every artifact clickable.

---

# 16. ARTIFACT VIEWER

Create an artifact explorer.

Allow users to view:

```text
red_team/reports/recon_map.json

red_team/reports/VULN-001_finding.json

security_judge/reports/VULN-001_judge_result.json

risk_analyzer/VULN-001_risk_report.json

blue_team/patches/VULN-001_patch_result.json

blue_team/tests/test_regression_vuln-001.py

verifier/VULN-001_verification_result.json
```

Features:

* JSON formatting
* Syntax highlighting
* Expand/collapse
* Copy button
* Timestamp
* Producing agent
* Artifact type

Only expose an allowlisted set of artifacts.

Do not create arbitrary filesystem browsing.

---

# 17. BEFORE VS AFTER

Create one of the strongest sections of the entire website:

# "From Vulnerable to Verified"

Display two sides.

### BEFORE

```text
🔴 Vulnerable

Attack succeeds
Unauthorized behavior possible
Security finding open
```

### AFTER

```text
🟢 Verified

Original attack blocked
Legitimate behavior preserved
Regression test passes
Adaptive attack blocked
```

Use actual pipeline results.

---

# 18. DEVELOPER IMPACT

The challenge requires measurable workflow improvement.

Create:

# "What changed for the developer?"

Show the traditional workflow:

```text
Recon
Manual

Finding validation
Manual

Risk assessment
Manual

Remediation investigation
Manual

Regression testing
Manual

Verification
Manual

Re-testing
Manual
```

Then:

```text
Autonomous workflow

Recon
Agent-assisted

Finding validation
Automated

Risk assessment
Automated

Remediation generation
Agent-assisted

Regression generation
Automated

Verification
Automated

Re-testing
Automated
```

The point is not to claim humans are unnecessary.

The point is to demonstrate that the system removes repetitive coordination work.

---

# 19. MEASUREMENT

Create a metrics panel.

Use actual measurable values from pipeline execution.

Possible metrics:

```text
Total pipeline runtime
Number of stages completed
Number of findings
Number confirmed
Number remediated
Number of regression tests
Number of verification checks
Number of adaptive attacks
```

Example:

```text
Pipeline Runtime
02:37

Stages
7 / 7

Findings
2

Confirmed
2

Remediated
2

Regression Tests
2

Verification Checks
2

Adaptive Re-Attacks
2
```

Do not fabricate numbers.

If a metric cannot be measured, don't display a fake number.

---

# 20. MANUAL VS AUTONOMOUS COMPARISON

Create a visual comparison.

### Traditional

```text
Developer
   ↓
Recon
   ↓
Security tester
   ↓
Developer
   ↓
Security reviewer
   ↓
Developer
   ↓
QA
   ↓
Security tester
```

### Our workflow

```text
                    ┌─ Recon
                    ├─ Red Team
Developer ──────────┼─ Judge
                    ├─ Risk
                    ├─ Blue Team
                    ├─ Verification
                    └─ Re-Attack
```

Emphasize:

```text
Fewer handoffs
Less context switching
Less repetitive validation
Faster feedback
Evidence at every step
```

Avoid making unsupported claims such as "90% faster".

---

# 21. DOCUMENT UNDERSTANDING

The challenge specifically mentions document understanding.

Create:

# "Agents don't just inspect code. They understand context."

Show the project documents:

```text
README.md
architecture.md
api.md
testing.md
```

Then:

```text
Project documentation
        ↓
Agent context
        ↓
Architecture understanding
        ↓
Attack surface discovery
        ↓
Targeted security testing
```

If the current implementation genuinely parses/uses these documents, display actual evidence.

If it doesn't, clearly label this section as the architecture/capability rather than pretending it already happened.

---

# 22. PARALLEL TASKS AND SUBAGENTS

Create a visual explanation of how the architecture can scale using multiple agents/subagents.

Example:

```text
                    SECURITY TASK
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    API Agent        Auth Agent       Config Agent
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                  Security Judge
```

If actual parallel execution is present, show actual runtime execution.

If not, label the visualization:

**"Parallel agent architecture"**

Never claim parallel execution occurred when it did not.

---

# 23. HUMAN CONTROL

Include:

# "AI accelerates the workflow. Developers remain in control."

Show:

```text
AI discovers
     ↓
AI validates
     ↓
AI analyzes
     ↓
AI proposes remediation
     ↓
Developer reviews
     ↓
Developer approves
     ↓
Verification confirms
```

This makes the workflow realistic and developer-focused.

---

# 24. DEMO MODE

Create a special presentation mode for hackathon judges.

Button:

```text
🎬 START DEMO
```

The demo should guide the presenter through:

```text
1. The Problem
2. Traditional Workflow
3. Our Solution
4. Agent Architecture
5. Run Pipeline
6. Recon
7. Red Team
8. Security Judge
9. Risk Analyzer
10. Blue Team
11. Verification
12. Adaptive Re-Attack
13. Evidence
14. Before vs After
15. Developer Impact
16. Final Result
```

The presenter should be able to:

```text
← Previous
Next →
```

Use large typography and high contrast so it works on a projector.

---

# 25. FINAL RESULT SCREEN

After a successful run, display:

# "Security Loop Complete"

Show a summary:

```text
Target
SecureBank

Pipeline
COMPLETE

Stages
7 / 7

Findings
X

Confirmed
X

Remediated
X

Regression Tests
X

Original Attacks Blocked
X

Adaptive Attacks Blocked
X

Runtime
XX:XX
```

Then:

```text
BEFORE
🔴 Vulnerable

AFTER
🟢 Verified
```

And a final statement:

> **One coordinated security feedback loop. From discovery to verified remediation.**

---

# 26. VISUAL STYLE

The design should feel like:

**Modern developer tooling + cybersecurity operations center + polished enterprise product.**

Avoid:

* Generic admin dashboard templates
* Excessive neon
* Matrix-style backgrounds
* Hacker clichés
* Excessive gradients
* Huge walls of text
* Too many charts
* Unnecessary animations

Use:

* Strong typography
* Spacious layouts
* Clear hierarchy
* Subtle borders
* Professional cards
* Elegant status indicators
* Smooth transitions
* Clean diagrams
* Meaningful animations

Color semantics:

```text
Red
Threat / attack

Blue
Remediation / Blue Team

Green
Verified / success

Amber
Running / warning

Neutral
Information
```

Never rely on color alone.

---

# 27. TECHNICAL REQUIREMENTS

Use the project's existing frontend stack if one exists.

Do not replace the existing application framework unnecessarily.

If a new frontend is required, use a modern stack such as:

```text
React
TypeScript
Vite
```

Use a component architecture.

Suggested:

```text
components/
  PipelineStage
  FindingCard
  ArtifactViewer
  MetricCard
  StatusBadge
  Timeline
  ArchitectureDiagram
  BeforeAfter
  AgentCard

pages/
  Overview
  Pipeline
  Findings
  Evidence
  Impact
  Architecture
  Demo
```

Keep components modular.

---

# 28. DATA ARCHITECTURE

The UI should consume the real pipeline outputs.

Prefer:

```text
Pipeline
    ↓
JSON artifacts
    ↓
Dashboard backend/API
    ↓
Frontend
```

Do not make the frontend directly access arbitrary files.

Create a safe backend API if required.

Possible endpoints:

```text
GET  /api/pipeline/status
POST /api/pipeline/run
GET  /api/pipeline/stages
GET  /api/findings
GET  /api/findings/:id
GET  /api/artifacts
GET  /api/artifacts/:id
GET  /api/metrics
```

Adapt these to the existing project instead of blindly creating them.

---

# 29. PIPELINE EXECUTION SAFETY

The website must NOT expose arbitrary shell execution.

Never allow:

```text
POST /run
{
  "command": "anything"
}
```

Instead use an allowlisted operation:

```text
POST /api/pipeline/run
```

which internally invokes the known pipeline:

```text
python pipeline_runner.py
```

Only local/demo execution is required.

Handle:

```text
Pipeline already running
Target unavailable
Pipeline failure
Missing artifacts
Malformed reports
```

with clean UI states.

---

# 30. ERROR STATES

Design proper states for:

### Target unavailable

```text
SecureBank is not running.

Start the target application at:

http://127.0.0.1:3000
```

### Pipeline running

```text
Security pipeline is already running.
```

### Pipeline failure

Show:

```text
Pipeline execution failed.

View execution details.
```

Do not show raw stack traces in the main interface.

---

# 31. EMPTY STATE

Before the first run:

```text
No security run yet.

Launch the autonomous pipeline to begin.
```

Do not fill the dashboard with fake findings.

---

# 32. RESPONSIVENESS

Primary target:

```text
1440px+
1280px
1024px
```

The website must be excellent on a laptop/projector.

Avoid layouts that require horizontal scrolling.

---

# 33. ACCESSIBILITY

Include:

* Keyboard navigation
* Visible focus states
* Semantic buttons
* Good contrast
* Text labels alongside icons
* Accessible status indicators
* Readable charts

---

# 34. PERFORMANCE

Do not aggressively poll the backend.

Use:

* WebSockets
* Server-Sent Events
* or reasonable polling

depending on the existing architecture.

The dashboard should remain responsive while the pipeline runs.

---

# 35. BUILD IN PHASES

Do NOT build the entire website in one uncontrolled pass.

Work through these phases.

---

## PHASE 1: Repository Understanding

Inspect:

```text
pipeline_runner.py
target_app/
red_team/
security_judge/
risk_analyzer/
blue_team/
verifier/
```

Understand:

* Pipeline execution
* Report formats
* Existing APIs
* Artifacts
* Timestamps
* Status information

Deliver a short implementation plan before building.

---

## PHASE 2: Visual Foundation

Build:

* Layout
* Navigation
* Typography
* Theme
* Components
* Responsive shell

Do not integrate the pipeline yet.

---

## PHASE 3: Storytelling

Build:

* Problem section
* Traditional workflow
* Solution explanation
* Seven-agent architecture
* Document understanding
* Multi-agent/subagent explanation

---

## PHASE 4: Live Pipeline

Build:

* Run button
* Pipeline status
* Stage visualization
* Stage details
* Runtime
* Error states

Connect to the real pipeline.

---

## PHASE 5: Findings + Evidence

Build:

* Findings
* Finding lifecycle
* Evidence chain
* Artifact viewer
* Before/after state

Use actual JSON artifacts.

---

## PHASE 6: Developer Impact

Build:

* Manual vs autonomous comparison
* Workflow metrics
* Runtime
* Automation coverage
* Rework reduction explanation

Only use measurable values where available.

---

## PHASE 7: Demo Mode

Build the guided presentation flow.

---

## PHASE 8: Integration Testing

Test the complete path:

```text
Open website
    ↓
Start SecureBank
    ↓
Click Run Pipeline
    ↓
pipeline_runner.py executes
    ↓
Seven stages execute
    ↓
Artifacts generated
    ↓
Website reads artifacts
    ↓
Dashboard updates
    ↓
Findings displayed
    ↓
Evidence displayed
    ↓
Impact displayed
```

---

## PHASE 9: Final Polish

Fix:

* visual inconsistencies
* loading states
* error states
* responsive behavior
* accessibility
* performance
* animation timing
* typography
* spacing

Then perform a complete demo from start to finish.

---

# 36. DEFINITION OF DONE

Do not consider the website complete until:

### Story

* [ ] Problem is immediately understandable.
* [ ] Current workflow is explained.
* [ ] Solution is clearly differentiated.
* [ ] Seven-stage workflow is visible.
* [ ] Agent roles are understandable.

### Live demonstration

* [ ] Pipeline can be launched.
* [ ] Pipeline status is visible.
* [ ] Stages update live.
* [ ] Runtime is displayed.
* [ ] Errors are handled.

### Security evidence

* [ ] Findings are displayed.
* [ ] Judge results are displayed.
* [ ] Risk analysis is displayed.
* [ ] Blue Team remediation is displayed.
* [ ] Regression tests are displayed.
* [ ] Verification is displayed.
* [ ] Adaptive re-attack is displayed.
* [ ] Artifact chain is visible.

### Impact

* [ ] Traditional workflow is compared with autonomous workflow.
* [ ] Real runtime is measured.
* [ ] Real pipeline outputs are measured.
* [ ] Manual coordination points are shown.
* [ ] No fabricated metrics are presented as facts.

### IBM BOB 2.0 concepts

* [ ] Agent workflow is demonstrated.
* [ ] Multi-agent architecture is demonstrated.
* [ ] Parallel/subagent architecture is explained accurately.
* [ ] Document understanding is explained accurately.
* [ ] Developer workflow improvement is clearly demonstrated.

### Demo

* [ ] Demo Mode exists.
* [ ] Projector-friendly.
* [ ] Clean UI.
* [ ] Fast to understand.
* [ ] Complete story from problem → solution → proof.

---

# 37. MOST IMPORTANT REQUIREMENT

Do not build a website that simply says:

> "We have seven agents."

Build a website that proves:

> **"Here is a painful developer security workflow. Here is how our agents coordinate it. Here is the live execution. Here is the evidence. Here is the remediation. Here is the verification. And here is the measurable result."**

The website itself should become part of the hackathon demonstration.

A judge should be able to watch the entire journey without needing to inspect the source code manually.

---

# FINAL DEMO FLOW

The ideal presentation should be:

```text
┌───────────────────────────────────────────┐
│ THE PROBLEM                               │
│ Security testing creates developer delay. │
└───────────────────┬───────────────────────┘
                    ↓
┌───────────────────────────────────────────┐
│ THE SOLUTION                              │
│ Autonomous DevSecOps feedback loop        │
└───────────────────┬───────────────────────┘
                    ↓
┌───────────────────────────────────────────┐
│ THE AGENTS                                │
│ Recon → Red → Judge → Risk → Blue → ...  │
└───────────────────┬───────────────────────┘
                    ↓
              [ RUN PIPELINE ]
                    ↓
┌───────────────────────────────────────────┐
│ LIVE EXECUTION                            │
│ 01 ✓ 02 ✓ 03 ✓ 04 ✓ 05 ✓ 06 ✓ 07 ✓      │
└───────────────────┬───────────────────────┘
                    ↓
┌───────────────────────────────────────────┐
│ EVIDENCE                                  │
│ Findings + reports + remediation          │
└───────────────────┬───────────────────────┘
                    ↓
┌───────────────────────────────────────────┐
│ BEFORE → AFTER                            │
│ Vulnerable → Verified                     │
└───────────────────┬───────────────────────┘
                    ↓
┌───────────────────────────────────────────┐
│ DEVELOPER IMPACT                          │
│ Less coordination + faster feedback       │
└───────────────────────────────────────────┘
```

Build toward this experience.

**Do not fake results. Do not invent metrics. Do not duplicate the pipeline. Make the existing work visible, interactive, understandable, and impressive.**
