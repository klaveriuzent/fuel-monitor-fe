import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { CContainer, CHeader, CHeaderNav, CHeaderToggler, CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'
import axios from 'axios'

const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const routeTitles = useSelector((state) => state.routeTitles) || {}

  const location = useLocation()
  const pageTitle = routeTitles[location.pathname] || 'Dashboard'

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const [locations, setLocations] = useState([])

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
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
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
            <span className="fw-semibold">username</span>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <div className="w-100 d-flex justify-content-between align-items-center px-4 py-2 border-top">
        {/* START - Select lokasi dari API */}
        <CFormSelect
          size="sm"
          style={{ maxWidth: '160px' }}
          aria-label="Select Group"
          onChange={(e) => dispatch({ type: 'set', filterGroup: e.target.value })}
        >
          <option value="all">All</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id_location}>
              {loc.location_area}
            </option>
          ))}
        </CFormSelect>

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
