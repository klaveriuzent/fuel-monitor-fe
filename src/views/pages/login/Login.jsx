import React, { useCallback, useEffect, useState } from 'react'
import { CButton, CCard, CCardBody, CContainer, CForm, CSpinner } from '@coreui/react'

const baseURL = import.meta.env.VITE_API_BASE_URL

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

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isApplicationLogin, setIsApplicationLogin] = useState(true)

  const IdApp = import.meta.env.VITE_APP_ID
  const KeyApp = import.meta.env.VITE_APP_KEY

  const sha256 = useCallback(async (message) => {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }, [])

  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      t: params.get('t') || '',
      v: params.get('v') || '',
    }
  }, [])

  const getLogin = useCallback(async () => {
    const guid = crypto.randomUUID()
    localStorage.setItem('GUID', guid)

    try {
      const res = await fetch(`${baseURL}auth/get_login?id=${IdApp}&id_trx=${guid}`)
      const json = await parseJsonResponse(res)
      if (json.objek) {
        window.location.href = json.objek
      }
    } catch (err) {
      setIsLoading(false)
      setIsApplicationLogin(true)
    }
  }, [IdApp])

  const handleAfterUserManagementLogin = useCallback(async (token) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${baseURL}auth/sso_validate?t=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      })
      const json = await parseJsonResponse(res)

      if (!res.ok) {
        throw new Error(json?.message || 'Authorization has been denied for this request.')
      }

      localStorage.setItem('user-data', JSON.stringify(json?.data || {}))
      window.location.href = '/fuelmonitoring/dashboard'
    } catch (error) {
      console.error('Login error:', error)
      alert(error?.message || 'Server sedang sibuk, silakan coba lagi.')
      window.location.href = '/fuelmonitoring/login'
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      const { t, v } = getQueryParams()

      if (!t && !v) {
        await getLogin()
        return
      }

      if (t && v) {
        const guid = localStorage.getItem('GUID')
        const valid = await sha256(guid + IdApp + KeyApp)

        if (valid === v) {
          await handleAfterUserManagementLogin(t)
        }
      }
    }

    run()
  }, [getLogin, getQueryParams, handleAfterUserManagementLogin, sha256, IdApp, KeyApp])

  const handleUserManagementLogin = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setIsApplicationLogin(false)
    getLogin()
  }

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <CSpinner size="sm" className="me-2" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: '#D1D5DB' }}
    >
      <CContainer className="d-flex justify-content-center">
        <div style={{ width: '360px' }}>
          <CCard className="shadow" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#303C54',
                color: '#fff',
                fontSize: '24px',
                fontWeight: 'bold',
                padding: '16px 24px',
              }}
            >
              Fuel Monitoring
            </div>
            <CCardBody>
              {isApplicationLogin && (
                <CForm onSubmit={handleUserManagementLogin}>
                  <div className="d-grid">
                    <CButton color="primary" type="submit">
                      Login with User Management
                    </CButton>
                  </div>
                </CForm>
              )}

              {!isApplicationLogin && (
                <>
                  <div
                    style={{
                      backgroundColor: '#e9eff4',
                      color: 'grey',
                      fontWeight: 500,
                      textAlign: 'center',
                      borderRadius: '4px',
                      padding: '8px',
                    }}
                  >
                    Login with User Management
                  </div>
                  <p style={{ marginLeft: '4px', marginTop: '8px' }}>Please wait...</p>
                </>
              )}
            </CCardBody>
          </CCard>
        </div>
      </CContainer>
    </div>
  )
}

export default Login
