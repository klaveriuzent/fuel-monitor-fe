import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { CContainer, CHeader, CHeaderNav, CHeaderToggler } from '@coreui/react'
import { Select } from 'antd'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'
import axios from 'axios'
import './AppHeader.scss'

const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const filterGroup = useSelector((state) => state.filterGroup)
  const routeTitles = useSelector((state) => state.routeTitles) || {}

  const location = useLocation()
  const pageTitle = routeTitles[location.pathname] || 'Dashboard'

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const [locations, setLocations] = useState([])
  const [displayName, setDisplayName] = useState('User')
  const [displayRole, setDisplayRole] = useState('-')

  useEffect(() => {
    const syncUserData = () => {
      try {
        const raw = localStorage.getItem('user-data')
        if (!raw) {
          setDisplayName('User')
          setDisplayRole('-')
          return
        }

        const parsed = JSON.parse(raw)
        const fullName = parsed?.full_name || parsed?.FullName || parsed?.username || 'User'
        const roleRaw = parsed?.role || '-'
        const role = String(roleRaw).toLowerCase() === 'superuser' ? 'admin' : roleRaw
        setDisplayName(fullName)
        setDisplayRole(role)
      } catch {
        setDisplayName('User')
        setDisplayRole('-')
      }
    }

    syncUserData()
    window.addEventListener('storage', syncUserData)
    return () => window.removeEventListener('storage', syncUserData)
  }, [])

  // fetch data lokasi
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data } = await axios.get(`${baseURL}location`)
        if (data && data.data) {
          setLocations(data.data)
        }
      } catch (err) {
        console.error('Error fetching locations:', err)
      }
    }
    fetchLocations()
  }, [baseURL])

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
      }
    }
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="sticky" className="app-header-glass mb-4 p-0" ref={headerRef}>
      <CContainer className="app-header-top-row border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="align-items-center me-auto">
          <h6 className="mb-0 ms-2 d-md-none text-center w-100">{pageTitle}</h6>
          <h5 className="mb-0 ms-3 fw-semibold d-none d-md-block">{pageTitle}</h5>
        </CHeaderNav>

        <CHeaderNav>
          <li className="nav-item d-flex align-items-center ms-3">
            <div className="d-flex flex-column align-items-end lh-sm">
              <span className="fw-semibold">{displayName}</span>
              <small className="text-medium-emphasis">{displayRole}</small>
            </div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <div className="app-header-glass-row w-100 d-flex justify-content-between align-items-center px-4 py-2 border-top">
        {/* START - Select lokasi dari API */}
        <Select
          size="small"
          className="app-header__group-select"
          popupClassName="app-header__group-select-dropdown"
          value={filterGroup || 'all'}
          onChange={(value) => dispatch({ type: 'set', filterGroup: value })}
          options={[
            { value: 'all', label: 'All' },
            ...locations.map((loc) => ({
              value: loc.id_location,
              label: loc.location_area,
            })),
          ]}
          aria-label="Select Group"
        />

        {/* END - Date & Time di kanan */}
        <span className="text-nowrap small">
          {new Date().toLocaleString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </CHeader>
  )
}

export default AppHeader
