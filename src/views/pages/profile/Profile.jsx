import React, { useMemo } from 'react'
import { CCard, CCardBody, CCol, CRow } from '@coreui/react'
import './profile.scss'

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

const Profile = () => {
  const userData = useMemo(() => parseUserData(), [])
  const entries = useMemo(
    () =>
      Object.entries(userData).filter(
        ([key]) =>
          key.toLowerCase() !== 'username' &&
          key.toLowerCase() !== 'role' &&
          key.toLowerCase() !== 'cache-t',
      ),
    [userData],
  )
  const fullName = userData?.full_name || '-'
  const username = userData?.username || '-'
  const roleRaw = userData?.role || '-'
  const role = String(roleRaw).toLowerCase() === 'superuser' ? 'admin' : roleRaw

  return (
    <CRow className="g-3 profile-page">
      <CCol xs={12}>
        <CCard className="profile-hero">
          <CCardBody>
            <div className="profile-hero__top">
              <div className="profile-hero__avatar">{(fullName || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <div className="profile-hero__title">{fullName}</div>
                <div className="profile-hero__subtitle">
                  {role} @{username}
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
                  const formatted = formatValue(value)
                  const isArray = Array.isArray(formatted)

                  return (
                    <div className="profile-grid__item" key={key}>
                      <div className="profile-grid__label">{formatLabel(key)}</div>
                      {isArray ? (
                        <div className="profile-grid__chips">
                          {formatted.length ? (
                            formatted.map((chip, chipIdx) => (
                              <span className="profile-grid__chip" key={`${key}-${String(chip)}-${chipIdx}`}>
                                {chip}
                              </span>
                            ))
                          ) : (
                            <span className="profile-grid__value">-</span>
                          )}
                        </div>
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
    </CRow>
  )
}

export default Profile
