import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AutoComplete } from 'antd'
import { useSelector } from 'react-redux'
import { CCard, CRow, CCol, CFormInput, CButton } from '@coreui/react'
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
  const [siteInputValue, setSiteInputValue] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return 'All Sites'

    try {
      const parsed = JSON.parse(saved)
      if (parsed?.siteFilter && parsed.siteFilter !== 'all') {
        return parsed.siteFilter
      }
    } catch {
      return 'All Sites'
    }

    return 'All Sites'
  })
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
      if (savedSite !== undefined) {
        setSiteFilter(savedSite)
        setSiteInputValue(savedSite === 'all' ? 'All Sites' : savedSite)
      }
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

  const siteAutoCompleteOptions = useMemo(
    () => [
      { value: 'All Sites', siteValue: 'all' },
      ...siteOptions.map((site) => ({
        value: site.id_site,
        siteValue: site.id_site,
      })),
    ],
    [siteOptions],
  )

  const handleSiteSelect = (_, option) => {
    const selectedSiteValue = option?.siteValue || 'all'
    setSiteFilter(selectedSiteValue)
    setSiteInputValue(option?.value || 'All Sites')
  }

  const handleSiteBlur = () => {
    const matchedOption = siteAutoCompleteOptions.find(
      (option) => option.value.toLowerCase() === String(siteInputValue || '').toLowerCase(),
    )
    if (matchedOption) {
      setSiteFilter(matchedOption.siteValue)
      setSiteInputValue(matchedOption.value)
      return
    }
    setSiteFilter('all')
    setSiteInputValue('All Sites')
  }

  const handleClearFilters = () => {
    setSearch('')
    setSiteFilter('all')
    setSiteInputValue('All Sites')
    localStorage.removeItem(storageKey)
  }

  return (
    <CCard className="app-subheader mb-3 p-3">
      <CRow className="align-items-center g-2">
        <CCol xs={12} sm={6} md={4}>
          <AutoComplete
            size="small"
            className="app-subheader__site-autocomplete"
            value={siteInputValue}
            options={siteAutoCompleteOptions}
            onSelect={handleSiteSelect}
            onChange={(value) => {
              setSiteInputValue(value)
              if (!value) setSiteFilter('all')
            }}
            onBlur={handleSiteBlur}
            filterOption={(inputValue, option) =>
              (option?.value ?? '').toUpperCase().includes(inputValue.toUpperCase())
            }
            style={{ width: '100%' }}
            placeholder="All Sites"
            allowClear
            popupClassName="app-subheader__site-autocomplete-dropdown"
          />
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
