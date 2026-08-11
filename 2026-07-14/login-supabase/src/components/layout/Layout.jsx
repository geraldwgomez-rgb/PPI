import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

function Layout({ session, rol }) {
  return (
    <div className="app-layout">
      <Sidebar rol={rol} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header session={session} />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
