import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilCursor, cilDrop, cilInbox } from '@coreui/icons'
import { Popover } from 'antd'
import './AppBottomNav.scss'

const transactionMenus = [
  { to: '/transactions', label: 'Transaksi', icon: cilDrop },
  { to: '/fuel-receive', label: 'Receive', icon: cilDrop },
  { to: '/fuel-stock', label: 'Stock', icon: cilDrop },
]

const AppBottomNav = () => {
  const location = useLocation()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const [openTransactionMenu, setOpenTransactionMenu] = useState(false)
  const isSidebarOpen = sidebarShow === true || sidebarShow === 'responsive'

  useEffect(() => {
    setOpenTransactionMenu(false)
  }, [location.pathname])

  const isTransactionActive = useMemo(
    () => transactionMenus.some((menu) => location.pathname === menu.to),
    [location.pathname],
  )

  const transactionContent = (
    <div className="app-bottom-nav__menu">
      {transactionMenus.map((menu) => (
        <NavLink key={menu.to} to={menu.to} className="app-bottom-nav__menu-item">
          <CIcon icon={menu.icon} className="app-bottom-nav__menu-icon" />
          <span>{menu.label}</span>
        </NavLink>
      ))}
    </div>
  )

  return (
    <nav
      className={`app-bottom-nav${isSidebarOpen ? ' is-hidden' : ''}`}
      aria-label="Bottom navigation"
    >
      <div className="app-bottom-nav__slot">
        <NavLink
          to="/dashboard"
          className={`app-bottom-nav__item${location.pathname === '/dashboard' ? ' is-active' : ''}`}
        >
          <CIcon icon={cilSpeedometer} className="app-bottom-nav__icon" />
          <span className="app-bottom-nav__label">Dashboard</span>
        </NavLink>
      </div>

      <div className="app-bottom-nav__slot">
        <Popover
          trigger="click"
          placement="top"
          open={openTransactionMenu}
          onOpenChange={setOpenTransactionMenu}
          content={transactionContent}
          rootClassName="app-bottom-nav__popover"
        >
          <button
            type="button"
            className={`app-bottom-nav__item app-bottom-nav__button${
              isTransactionActive ? ' is-active' : ''
            }`}
          >
            <CIcon icon={cilCursor} className="app-bottom-nav__icon" />
            <span className="app-bottom-nav__label">Transaksi</span>
          </button>
        </Popover>
      </div>

      <div className="app-bottom-nav__slot">
        <NavLink
          to="/data-properties"
          className={`app-bottom-nav__item${location.pathname === '/data-properties' ? ' is-active' : ''}`}
        >
          <CIcon icon={cilInbox} className="app-bottom-nav__icon" />
          <span className="app-bottom-nav__label">Properties</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default AppBottomNav
