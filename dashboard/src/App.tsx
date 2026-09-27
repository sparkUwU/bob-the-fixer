import { useState } from 'react'
import { OverviewPage } from './pages/OverviewPage'
import { PipelinePage } from './pages/PipelinePage'
import { FindingsPage } from './pages/FindingsPage'
import { EvidencePage } from './pages/EvidencePage'
import { ImpactPage } from './pages/ImpactPage'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { DemoMode } from './pages/DemoMode'

type Page = 'overview' | 'pipeline' | 'findings' | 'evidence' | 'impact' | 'architecture'

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'overview',      label: 'Overview'      },
  { id: 'pipeline',      label: 'Live Pipeline' },
  { id: 'findings',      label: 'Findings'      },
  { id: 'evidence',      label: 'Evidence'      },
  { id: 'impact',        label: 'Impact'        },
  { id: 'architecture',  label: 'Architecture'  },
]

export default function App() {
  const [page, setPage] = useState<Page>('overview')
  const [demoMode, setDemoMode] = useState(false)

  if (demoMode) {
    return <DemoMode onExit={() => setDemoMode(false)} onNav={(p: Page) => { setDemoMode(false); setPage(p) }} />
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            SecureBank
          </div>
          <div className="nav-links">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`nav-link${page === item.id ? ' active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="nav-actions">
            <button className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
              onClick={() => setDemoMode(true)}>
              🎬 Demo Mode
            </button>
          </div>
        </div>
      </nav>
      <main className="page-wrapper">
        {page === 'overview'     && <OverviewPage     onNav={setPage} />}
        {page === 'pipeline'     && <PipelinePage     />}
        {page === 'findings'     && <FindingsPage     />}
        {page === 'evidence'     && <EvidencePage     />}
        {page === 'impact'       && <ImpactPage       />}
        {page === 'architecture' && <ArchitecturePage />}
      </main>
    </>
  )
}
