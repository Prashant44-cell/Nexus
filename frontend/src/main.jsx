import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import ClientApp from './ClientApp.jsx'
import AdminApp from './AdminApp.jsx'
import LumenHero from './components/LumenHero.jsx'
import './index.css'

function Root() {
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase()
    const search = window.location.search.toLowerCase()
    const port = window.location.port

    if (
      path.startsWith('/admin') ||
      path.includes('admin.html') ||
      search.includes('portal=admin') ||
      search.includes('view=admin') ||
      port === '3001'
    ) {
      return 'admin'
    }

    if (search.includes('view=app') || search.includes('portal=client')) {
      return 'client'
    }

    // Default to the LŪMEN // ÍNDEX welcome landing page before every other page
    return 'welcome'
  }

  const [currentView, setCurrentView] = useState(getInitialView)
  const [isExitingWelcome, setIsExitingWelcome] = useState(false)

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase()
      const search = window.location.search.toLowerCase()
      const port = window.location.port

      if (
        path.startsWith('/admin') ||
        path.includes('admin.html') ||
        search.includes('portal=admin') ||
        search.includes('view=admin') ||
        port === '3001'
      ) {
        setCurrentView('admin')
      }
    }

    window.addEventListener('popstate', checkRoute)
    window.addEventListener('hashchange', checkRoute)
    return () => {
      window.removeEventListener('popstate', checkRoute)
      window.removeEventListener('hashchange', checkRoute)
    }
  }, [])

  const handleExploreBanking = () => {
    setIsExitingWelcome(true)
    setTimeout(() => {
      setCurrentView('client')
      setIsExitingWelcome(false)
      // Update browser history so refresh keeps app view if wanted
      if (window.history.pushState) {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?view=app';
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    }, 450)
  }

  const handleReturnToWelcome = () => {
    if (window.history.pushState) {
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
    setCurrentView('welcome')
  }

  if (currentView === 'admin') {
    return <AdminApp />
  }

  if (currentView === 'welcome') {
    return (
      <div
        style={{
          transition: 'all 0.45s cubic-bezier(0.76, 0, 0.24, 1)',
          opacity: isExitingWelcome ? 0 : 1,
          transform: isExitingWelcome ? 'scale(1.04) translateY(-12px)' : 'scale(1) translateY(0)',
          filter: isExitingWelcome ? 'blur(8px)' : 'none',
          pointerEvents: isExitingWelcome ? 'none' : 'auto'
        }}
      >
        <LumenHero onExplore={handleExploreBanking} />
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      <ClientApp onReturnToWelcome={handleReturnToWelcome} />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
