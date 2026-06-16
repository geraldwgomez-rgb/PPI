import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
