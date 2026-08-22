import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import ClientApp from './ClientApp.jsx'
import AdminApp from './AdminApp.jsx'
import './index.css'

function Root() {
  const getIsAdmin = () => {
    const path = window.location.pathname.toLowerCase()
    const search = window.location.search.toLowerCase()
    const port = window.location.port
    return path.startsWith('/admin') ||
           path.includes('admin.html') ||
           search.includes('portal=admin') ||
           search.includes('view=admin') ||
           port === '3001'
  }

  const [isAdmin, setIsAdmin] = useState(getIsAdmin)

  useEffect(() => {
    const checkRoute = () => setIsAdmin(getIsAdmin())
    window.addEventListener('popstate', checkRoute)
    window.addEventListener('hashchange', checkRoute)
    return () => {
      window.removeEventListener('popstate', checkRoute)
      window.removeEventListener('hashchange', checkRoute)
    }
  }, [])

  return isAdmin ? <AdminApp /> : <ClientApp />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
