import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  CAvatar,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormSwitch,
  useColorModes,
} from '@coreui/react'

import avatar0 from './../../assets/images/avatars/0.jpg'

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

    window.location.href = '/fuelmonitoring/login'
  } catch (error) {
    console.error('Logout gagal', error)
  }
}

const AppHeaderDropdown = () => {
  const dispatch = useDispatch()
  const { setColorMode } = useColorModes(themeStorageKey)
  const [activeTheme, setActiveTheme] = useState('light')

  useEffect(() => {
    setActiveTheme(resolveCurrentTheme())
  }, [])

  useEffect(() => {
    dispatch({ type: 'set', theme: activeTheme })
  }, [dispatch, activeTheme])

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
        <CAvatar src={avatar0} size="md" />
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
        <CDropdownItem onClick={handleLogout}>Log Out</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
