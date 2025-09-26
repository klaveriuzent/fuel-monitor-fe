import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = () => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main wrapper */}
      <div className="wrapper d-flex flex-column min-vh-100 flex-grow-1">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <AppContent />
        </div>
        {/* <AppFooter /> */}
      </div>
    </div>
  )
}

export default DefaultLayout
