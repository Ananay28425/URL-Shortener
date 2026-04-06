import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import PageContainer from './PageContainer'

function shouldShowSidebar(pathname) {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/analytics')
}

export default function AppShell() {
  const { pathname } = useLocation()
  const showSidebar = shouldShowSidebar(pathname)

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <PageContainer className={showSidebar ? 'lg:py-10' : ''}>
        <div className={showSidebar ? 'grid gap-8 lg:grid-cols-[16rem_1fr]' : ''}>
          {showSidebar ? <Sidebar /> : null}
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

