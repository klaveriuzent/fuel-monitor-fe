import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilCursor, cilDrop, cilInbox, cilUser } from '@coreui/icons'
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
  const transactionMenuRef = useRef(null)
  const isSidebarOpen = sidebarShow === true || sidebarShow === 'responsive'

  useEffect(() => {
    if (!openTransactionMenu) return undefined

    const handleClickOutside = (event) => {
      const target = event.target
      if (transactionMenuRef.current && !transactionMenuRef.current.contains(target)) {
        setOpenTransactionMenu(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenTransactionMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openTransactionMenu])

  const isTransactionActive = useMemo(
    () => transactionMenus.some((menu) => location.pathname === menu.to),
    [location.pathname],
  )

  const transactionContent = (
    <div className="app-bottom-nav__custom-popover" role="menu" aria-label="Transaction menu">
      <div className="app-bottom-nav__menu">
        {transactionMenus.map((menu) => (
          <NavLink
            key={menu.to}
            to={menu.to}
            className="app-bottom-nav__menu-item"
            onClick={() => setOpenTransactionMenu(false)}
          >
            <CIcon icon={menu.icon} className="app-bottom-nav__menu-icon" />
            <span>{menu.label}</span>
          </NavLink>
        ))}
      </div>
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
          onClick={() => setOpenTransactionMenu(false)}
        >
          <CIcon icon={cilSpeedometer} className="app-bottom-nav__icon" />
          <span className="app-bottom-nav__label">Dashboard</span>
        </NavLink>
      </div>

      <div className="app-bottom-nav__slot app-bottom-nav__slot--menu" ref={transactionMenuRef}>
        <button
          type="button"
          className={`app-bottom-nav__item app-bottom-nav__button${
            isTransactionActive ? ' is-active' : ''
          }`}
          aria-haspopup="menu"
          aria-expanded={openTransactionMenu}
          onClick={() => setOpenTransactionMenu((prev) => !prev)}
        >
          <CIcon icon={cilCursor} className="app-bottom-nav__icon" />
          <span className="app-bottom-nav__label">Transaksi</span>
        </button>
        {openTransactionMenu ? transactionContent : null}
      </div>

      <div className="app-bottom-nav__slot">
        <NavLink
          to="/data-properties"
          className={`app-bottom-nav__item${location.pathname === '/data-properties' ? ' is-active' : ''}`}
          onClick={() => setOpenTransactionMenu(false)}
        >
          <CIcon icon={cilInbox} className="app-bottom-nav__icon" />
          <span className="app-bottom-nav__label">Properties</span>
        </NavLink>
      </div>

      <div className="app-bottom-nav__slot">
        <NavLink
          to="/profile"
          className={`app-bottom-nav__item${location.pathname === '/profile' ? ' is-active' : ''}`}
          onClick={() => setOpenTransactionMenu(false)}
        >
          <CIcon icon={cilUser} className="app-bottom-nav__icon" />
          <span className="app-bottom-nav__label">Profile</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default AppBottomNav
