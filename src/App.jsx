import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { clearUnauthorizedFlag } from './utils/unauthorized'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const baseURL = import.meta.env.VITE_API_BASE_URL
const SSO_REDIRECT_FLAG = 'fm_sso_redirect_done'

const parseJsonResponse = async (response) => {
  const rawText = await response.text()
  if (!rawText) return {}

  try {
    return JSON.parse(rawText)
  } catch {
    return {
      message: rawText.trim() || 'Invalid server response',
    }
  }
}

const ProtectedEntry = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(true)

  useEffect(() => {
    let isMounted = true

    const validateSession = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('t') || ''

      try {
        if (!token) {
          const res = await fetch(`${baseURL}auth/session`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'include',
          })
          const json = await parseJsonResponse(res)

          if (!res.ok) {
            if (res.status === 404) {
              throw new Error('Endpoint auth/session belum tersedia. Restart backend API yang terbaru.')
            }
            throw new Error(json?.message || 'Authorization has been denied for this request.')
          }

          window.localStorage.setItem('user-data', JSON.stringify(json?.data || {}))
          window.sessionStorage.removeItem(SSO_REDIRECT_FLAG)

          if (isMounted) {
            setIsAuthorizing(false)
          }
          return
        }

        const res = await fetch(`${baseURL}auth/sso_validate?t=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        const json = await parseJsonResponse(res)

        if (!res.ok) {
          throw new Error(json?.message || 'Authorization has been denied for this request.')
        }

        window.localStorage.setItem('user-data', JSON.stringify(json?.data || {}))
        const hasRedirected = window.sessionStorage.getItem(SSO_REDIRECT_FLAG) === '1'
        if (!hasRedirected) {
          window.sessionStorage.setItem(SSO_REDIRECT_FLAG, '1')
          window.location.replace('/fuelmonitoring/dashboard')
          return
        }

        window.sessionStorage.removeItem(SSO_REDIRECT_FLAG)
        window.history.replaceState({}, '', '/fuelmonitoring/dashboard')

        if (isMounted) {
          setIsAuthorizing(false)
        }
      } catch (error) {
        console.error('SSO validation error', error)
        window.sessionStorage.removeItem(SSO_REDIRECT_FLAG)
        window.localStorage.removeItem('user-data')
        window.alert(error?.message || 'Authorization has been denied for this request.')
        window.location.href = '/fuelmonitoring/login'
      }
    }

    validateSession()

    return () => {
      isMounted = false
    }
  }, [])

  if (isAuthorizing) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    )
  }

  return <DefaultLayout />
}
// const Register = React.lazy(() => import('./views/pages/register/Register'))
// const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
// const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    clearUnauthorizedFlag()

    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
      return
    }

    if (isColorModeSet()) {
      return
    }

    // 🟩 Tambahan: fallback kalau belum ada theme di localStorage
    const savedTheme = localStorage.getItem('coreui-free-react-admin-template-theme')
    if (savedTheme) {
      setColorMode(savedTheme)
    } else {
      setColorMode(storedTheme || 'light') // ✅ default light
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter basename="/fuelmonitoring">
      {' '}
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          {/*
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} /> */}
          <Route path="*" name="Home" element={<ProtectedEntry />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
