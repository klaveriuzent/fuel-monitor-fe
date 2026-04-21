import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormSwitch,
  useColorModes,
} from '@coreui/react'

const themeStorageKey = 'coreui-free-react-admin-template-theme'
const baseURL = import.meta.env.VITE_API_BASE_URL

const resolveCurrentTheme = () => {
  if (typeof document !== 'undefined') {
    const domTheme = document.documentElement?.dataset?.coreuiTheme
    if (domTheme) {
      return domTheme
    }
  }

  if (typeof window !== 'undefined') {
    const storedTheme = window.localStorage.getItem(themeStorageKey)
    if (storedTheme) {
      return storedTheme
    }
  }

  return 'light'
}

const handleLogout = async () => {
  try {
    await fetch(`${baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user-data')
    }

    window.location.href = '/fuelmonitoring/login'
  } catch (error) {
    console.error('Logout gagal', error)
  }
}

const AppHeaderDropdown = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { setColorMode } = useColorModes(themeStorageKey)
  const [activeTheme, setActiveTheme] = useState(() => resolveCurrentTheme())
  const [avatarInitial, setAvatarInitial] = useState('U')

  useEffect(() => {
    dispatch({ type: 'set', theme: activeTheme })
  }, [dispatch, activeTheme])

  useEffect(() => {
    const syncAvatarInitial = () => {
      try {
        const raw = window.localStorage.getItem('user-data')
        if (!raw) {
          setAvatarInitial('U')
          return
        }
        const parsed = JSON.parse(raw)
        const fullName = parsed?.full_name || parsed?.FullName || parsed?.username || 'User'
        const initial = String(fullName).trim().charAt(0).toUpperCase() || 'U'
        setAvatarInitial(initial)
      } catch {
        setAvatarInitial('U')
      }
    }

    syncAvatarInitial()
    window.addEventListener('storage', syncAvatarInitial)
    return () => window.removeEventListener('storage', syncAvatarInitial)
  }, [])

  const handleThemeToggle = () => {
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark'
    setColorMode(nextTheme)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(themeStorageKey, nextTheme)
    }
    setActiveTheme(nextTheme)
  }

  return (
    <CDropdown variant="nav-item" className="ms-3">
      <CDropdownToggle
        className="d-flex align-items-center border-0 bg-transparent p-0"
        caret={false}
      >
        <span
          className="d-inline-flex align-items-center justify-content-center text-white fw-semibold"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d6efd, #20c997)',
            boxShadow: '0 8px 18px rgba(13, 110, 253, 0.24)',
          }}
        >
          {avatarInitial}
        </span>
      </CDropdownToggle>
      <CDropdownMenu placement="bottom-end">
        <CDropdownItem
          component="div"
          className="d-flex align-items-center justify-content-between py-2"
        >
          <span className="me-3">Dark Mode</span>
          <CFormSwitch
            id="app-theme-switch"
            checked={activeTheme === 'dark'}
            onChange={handleThemeToggle}
          />
        </CDropdownItem>
        <CDropdownItem onClick={() => navigate('/profile')}>Profile</CDropdownItem>
        <CDropdownItem onClick={handleLogout}>Log Out</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
