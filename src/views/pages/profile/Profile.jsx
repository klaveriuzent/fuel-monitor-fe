import React, { useMemo } from 'react'
import { CCard, CCardBody, CCol, CRow } from '@coreui/react'
import { CopyOutlined } from '@ant-design/icons'
import './profile.scss'

const baseURL = import.meta.env.VITE_API_BASE_URL

const parseUserData = () => {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem('user-data')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    return {}
  }
}

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.length ? value : []
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  return String(value)
}

const formatLabel = (key) =>
  key
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const normalizeFieldDisplay = (key, value) => {
  const normalizedKey = String(key || '').toLowerCase()
  if (normalizedKey === 'email' && typeof value === 'string') {
    return value.toLowerCase()
  }
  return value
}

const Profile = () => {
  const userData = useMemo(() => parseUserData(), [])
  const entries = useMemo(() => {
    const filtered = Object.entries(userData).filter(
      ([key]) =>
        key.toLowerCase() !== 'username' &&
        key.toLowerCase() !== 'role' &&
        key.toLowerCase() !== 'cache-t',
    )

    const priority = { full_name: 0, email: 1, company: 2, ba_code: 3 }
    return filtered.sort(([a], [b]) => {
      const pa = priority[String(a).toLowerCase()]
      const pb = priority[String(b).toLowerCase()]
      const ra = pa ?? Number.MAX_SAFE_INTEGER
      const rb = pb ?? Number.MAX_SAFE_INTEGER
      if (ra !== rb) return ra - rb
      return 0
    })
  }, [userData])
  const fullName = userData?.full_name || '-'
  const username = userData?.username || '-'
  const usernameLower = String(username || '-').toLowerCase()
  const cacheToken = userData?.['cache-t'] || ''
  const roleRaw = userData?.role || '-'
  const role = String(roleRaw).toLowerCase() === 'superuser' ? 'admin' : roleRaw
  const isEmphasizedField = (key) => {
    const normalized = String(key || '').toLowerCase()
    return normalized === 'ba_code' || normalized === 'company'
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
  const handleCopyCacheToken = async () => {
    const text = String(cacheToken || '').trim()
    if (!text) return
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <CRow className="g-3 profile-page">
      <CCol xs={12}>
        <CCard className="profile-hero">
          <CCardBody>
            <div className="profile-hero__top">
              <div className="profile-hero__avatar">
                {(fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="profile-hero__title-row">
                  <div className="profile-hero__title">{fullName}</div>
                  <button
                    type="button"
                    className="profile-hero__copy-btn"
                    onClick={() => {
                      void handleCopyCacheToken()
                    }}
                    title="Copy cache-t"
                    aria-label="Copy cache-t"
                  >
                    <CopyOutlined />
                  </button>
                </div>
                <div className="profile-hero__subtitle">
                  {role} @{usernameLower}
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="profile-hero profile-card">
          <CCardBody>
            {entries.length === 0 ? (
              <div className="text-medium-emphasis">Tidak ada.</div>
            ) : (
              <div className="profile-grid">
                {entries.map(([key, value]) => {
                  const formatted = normalizeFieldDisplay(key, formatValue(value))
                  const isArray = Array.isArray(formatted)
                  const isEmphasized = isEmphasizedField(key)

                  return (
                    <div className="profile-grid__item" key={key}>
                      <div className="profile-grid__label">{formatLabel(key)}</div>
                      {isArray ? (
                        isEmphasized ? (
                          <span className="profile-grid__value">
                            {formatted.length ? formatted.join(', ') : '-'}
                          </span>
                        ) : (
                          <div className="profile-grid__chips">
                            {formatted.length ? (
                              formatted.map((chip, chipIdx) => (
                                <span
                                  className={`profile-grid__chip${isEmphasized ? ' profile-grid__chip--accent' : ''}`}
                                  key={`${key}-${String(chip)}-${chipIdx}`}
                                >
                                  {chip}
                                </span>
                              ))
                            ) : (
                              <span className="profile-grid__value">-</span>
                            )}
                          </div>
                        )
                      ) : (
                        <pre className="profile-grid__value">{formatted}</pre>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <div className="profile-logout-wrap">
          <button
            type="button"
            className="profile-logout-text"
            onClick={() => {
              void handleLogout()
            }}
          >
            Log Out
          </button>
        </div>
      </CCol>
    </CRow>
  )
}

export default Profile
