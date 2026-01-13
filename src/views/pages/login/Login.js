import React, { useEffect, useState } from 'react'
import { CButton, CCard, CCardBody, CContainer, CForm, CSpinner } from '@coreui/react'
import { v4 as GUID } from 'uuid'

const baseURL = import.meta.env.VITE_API_BASE_URL

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isApplicationLogin, setIsApplicationLogin] = useState(true)

  const IdApp = 'adf47b09-2646-4b84-a6dc-aaf590909932'
  const KeyApp = 'iKWY4qVOByG/oxIVyBi4BtkhVUc9+qlpuDb+CYLhyW4='

  const sha256 = async (message) => {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search)
    return {
      t: params.get('t') || '',
      v: params.get('v') || '',
    }
  }

  const getLogin = async () => {
    const guid = crypto.randomUUID()
    localStorage.setItem('GUID', guid)

    try {
      const res = await fetch(`${baseURL}/user/get_login?id=${IdApp}&id_trx=${guid}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (json.objek) {
        window.location.href = json.objek
      }
    } catch (err) {
      setIsApplicationLogin(true)
    }
  }

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
          handleAfterUserManagementLogin(t)
        }
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAfterUserManagementLogin = async (token) => {
    try {
      const headers = {
        Accept: 'application/json',
        authenticationToken: token,
        'Content-Type': 'application/json',
      }

      const validDetail = await sha256(token)

      await fetch(`${baseURL}/auth/get_token`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          id: token,
          token: token,
          valid_detail: validDetail,
        }),
      })

      const res = await fetch(
        `${baseURL}/user/detail_by_name_application?name_application=FuelMonitoring`,
        {
          headers,
          credentials: 'include',
        },
      )

      const json = await res.json()

      if (json.result === true) {
        localStorage.setItem('user-data', JSON.stringify(json.objek))

        window.location.href = '/dashboard'
      } else {
        alert('Server sedang sibuk, silakan coba lagi.')
      }
    } catch (error) {
      console.error('Login error:', error)
      location.reload()
    }
  }

  const handleUserManagementLogin = (e) => {
    e.preventDefault()
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
