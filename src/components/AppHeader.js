import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { CContainer, CHeader, CHeaderNav, CHeaderToggler, CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  // const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const routeTitles = useSelector((state) => state.routeTitles) || {}

  const location = useLocation()
  const pageTitle = routeTitles[location.pathname] || 'Dashboard'

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
          <h6 className="mb-0 ms-2 d-md-none text-center w-100">{pageTitle}</h6>{' '}
          {/* versi mobile */}
          <h5 className="mb-0 ms-3 fw-semibold d-none d-md-block">{pageTitle}</h5>{' '}
          {/* versi desktop */}
        </CHeaderNav>

        <CHeaderNav>
          <li className="nav-item d-flex align-items-center ms-3">
            <span className="fw-semibold">username</span>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <div className="w-100 d-flex justify-content-between align-items-center px-4 py-2 border-top">
        {/* START - Select di kiri */}
        <CFormSelect size="sm" style={{ maxWidth: '160px' }} aria-label="Select example">
          <option>Select Group</option>
          <option value="0">All</option>
          <option value="1">LSIP</option>
          <option value="2">SIMP</option>
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
