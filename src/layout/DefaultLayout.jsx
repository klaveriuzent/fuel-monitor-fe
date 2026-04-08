import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader, AppBottomNav } from '../components/index'

const DefaultLayout = () => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main wrapper */}
      <div className="wrapper d-flex flex-column min-vh-100 flex-grow-1">
        <AppHeader />
        <div className="body app-body-with-bottom-nav flex-grow-1 px-3">
          <AppContent />
        </div>
        <AppBottomNav />
        {/* <AppFooter /> */}
      </div>
    </div>
  )
}

export default DefaultLayout
