import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CCard, CRow, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react'
import axios from 'axios'
import './AppSubHeader.scss'

const DEFAULT_STORAGE_KEY = 'app-subheader-stock-filters'

const AppSubHeaderStock = ({
  search,
  setSearch,
  siteFilter,
  setSiteFilter,
  onExport,
  isExportDisabled = false,
  storageKey = DEFAULT_STORAGE_KEY,
}) => {
  const filterGroup = useSelector((state) => state.filterGroup)
  const [siteOptions, setSiteOptions] = useState([])
  const baseURL = import.meta.env.VITE_API_BASE_URL

  const fetchSites = useCallback(async () => {
    try {
      const url =
        filterGroup && filterGroup !== 'all'
          ? `${baseURL}site?id_location=${filterGroup}`
          : `${baseURL}site`
      const { data } = await axios.get(url)
      setSiteOptions(Array.isArray(data?.data) ? data.data : [])
    } catch {
      setSiteOptions([])
    }
  }, [baseURL, filterGroup])

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return

    try {
      const { search: savedSearch, siteFilter: savedSite } = JSON.parse(saved)
      if (savedSearch !== undefined) setSearch(savedSearch)
      if (savedSite !== undefined) setSiteFilter(savedSite)
    } catch {
      console.warn('Failed to parse saved filters')
    }
  }, [setSearch, setSiteFilter, storageKey])

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        search,
        siteFilter,
      }),
    )
  }, [search, siteFilter, storageKey])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const handleClearFilters = () => {
    setSearch('')
    setSiteFilter('all')
    localStorage.removeItem(storageKey)
  }

  return (
    <CCard className="app-subheader mb-3 p-3">
      <CRow className="align-items-center g-2">
        <CCol xs={12} sm={6} md={4}>
          <CFormSelect size="sm" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
            <option value="all">All Sites</option>
            {siteOptions.map((site) => (
              <option key={site.id_site || site.id} value={site.id_site}>
                {site.id_site}
              </option>
            ))}
          </CFormSelect>
        </CCol>

        <CCol xs={12} sm={12} md={8}>
          <div className="app-subheader__search d-flex align-items-center gap-2">
            <CFormInput
              type="text"
              placeholder="Search id tank or site ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
              className="app-subheader__search-input"
            />
            <CButton color="secondary" size="sm" onClick={handleClearFilters}>
              Clear
            </CButton>
            {onExport && (
              <CButton
                color="success"
                size="sm"
                className="text-white"
                style={{ whiteSpace: 'nowrap', minWidth: '154.5px' }}
                onClick={onExport}
                disabled={isExportDisabled}
              >
                Export to Excel
              </CButton>
            )}
          </div>
        </CCol>
      </CRow>
    </CCard>
  )
}

export default AppSubHeaderStock
