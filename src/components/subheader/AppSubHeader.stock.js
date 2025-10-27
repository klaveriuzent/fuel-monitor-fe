import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Collapse, Tag } from 'antd'
import { CCard, CRow, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react'
import axios from 'axios'

import './AppSubHeader.scss'

const DEFAULT_STORAGE_KEY = 'app-subheader-stock-filters'
const { Panel } = Collapse
const { CheckableTag } = Tag

const AppSubHeaderStock = ({
  search,
  setSearch,
  siteFilter,
  setSiteFilter,
  columns = [],
  visibleColumnKeys,
  setVisibleColumnKeys,
  storageKey = DEFAULT_STORAGE_KEY,
}) => {
  const filterGroup = useSelector((state) => state.filterGroup)
  const [siteOptions, setSiteOptions] = useState([])
  const baseURL = import.meta.env.VITE_API_BASE_URL

  const fetchSites = useCallback(async () => {
    try {
      const url =
        filterGroup && filterGroup !== 'all'
          ? `${baseURL}/site?id_location=${filterGroup}`
          : `${baseURL}/site`
      const { data } = await axios.get(url)
      setSiteOptions(Array.isArray(data?.data) ? data.data : [])
    } catch {
      setSiteOptions([])
    }
  }, [baseURL, filterGroup])

  const columnOptions = useMemo(() => {
    const normalizeKey = (column) => {
      if (!column) return null
      if (column.key) return column.key
      if (Array.isArray(column.dataIndex)) {
        return column.dataIndex.filter(Boolean).join('.')
      }
      return column.dataIndex || null
    }

    const normalizeLabel = (column, fallback) => {
      const { title } = column || {}

      if (typeof title === 'string' || typeof title === 'number') return String(title)

      if (React.isValidElement(title)) {
        const child = title.props?.children
        if (typeof child === 'string' || typeof child === 'number') {
          return String(child)
        }
      }

      if (Array.isArray(title)) return title.filter(Boolean).join(' ')

      return fallback
    }

    return columns
      .map((column) => {
        const key = normalizeKey(column)
        if (!key) return null
        const fallbackLabel = key.toString().replace(/_/g, ' ')
        const label = normalizeLabel(column, fallbackLabel)
        return { key, label }
      })
      .filter(Boolean)
  }, [columns])

  const availableColumnKeys = useMemo(
    () => columnOptions.map((option) => option.key),
    [columnOptions],
  )

  const activeColumnKeys = useMemo(() => {
    if (Array.isArray(visibleColumnKeys)) {
      return visibleColumnKeys
    }
    return availableColumnKeys
  }, [availableColumnKeys, visibleColumnKeys])

  const areArraysEqual = useCallback((a = [], b = []) => {
    if (a.length !== b.length) return false
    return a.every((value) => b.includes(value))
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const {
        search: savedSearch,
        siteFilter: savedSite,
        visibleColumnKeys: savedVisible,
      } = JSON.parse(saved)

      if (savedSearch !== undefined) setSearch(savedSearch)
      if (savedSite !== undefined) setSiteFilter(savedSite)

      if (Array.isArray(savedVisible) && setVisibleColumnKeys) {
        const filteredColumns = savedVisible.filter((key) => availableColumnKeys.includes(key))
        if (filteredColumns.length) {
          setVisibleColumnKeys((prev = []) =>
            areArraysEqual(prev, filteredColumns) ? prev : filteredColumns,
          )
        } else if (availableColumnKeys.length) {
          setVisibleColumnKeys((prev = []) =>
            areArraysEqual(prev, availableColumnKeys) ? prev : availableColumnKeys,
          )
        }
      }
    }
  }, [
    setSearch,
    setSiteFilter,
    setVisibleColumnKeys,
    availableColumnKeys,
    areArraysEqual,
    storageKey,
  ])

  useEffect(() => {
    if (availableColumnKeys.length && setVisibleColumnKeys) {
      setVisibleColumnKeys((prev = []) => (prev.length ? prev : availableColumnKeys))
    }
  }, [columns, availableColumnKeys, setVisibleColumnKeys])

  useEffect(() => {
    const filters = {
      search,
      siteFilter,
      visibleColumnKeys: Array.isArray(activeColumnKeys) ? activeColumnKeys : availableColumnKeys,
    }
    localStorage.setItem(storageKey, JSON.stringify(filters))
  }, [search, siteFilter, activeColumnKeys, availableColumnKeys, storageKey])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const handleClearFilters = () => {
    setSearch('')
    setSiteFilter('all')

    if (setVisibleColumnKeys && availableColumnKeys.length) {
      setVisibleColumnKeys(availableColumnKeys)
    }

    localStorage.removeItem(storageKey)
  }

  const handleColumnToggle = (columnKey) => {
    if (!setVisibleColumnKeys) return
    setVisibleColumnKeys((prev = []) => {
      const current = Array.isArray(prev) ? prev : []
      const isActive = current.includes(columnKey)
      const updated = isActive
        ? current.filter((key) => key !== columnKey)
        : [...current, columnKey]
      return availableColumnKeys.filter((key) => updated.includes(key))
    })
  }

  return (
    <CCard className="app-subheader mb-3 p-3">
      <CRow className="align-items-center g-2">
        <CCol xs={12} sm={6} md={4}>
          <CFormSelect size="sm" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
            <option value="all">All Sites</option>
            {siteOptions.map((site) => (
              <option key={site.id} value={site.id_site}>
                {site.id_site}
              </option>
            ))}
          </CFormSelect>
        </CCol>

        <CCol xs={12} sm={12} md={8}>
          <div className="app-subheader__search d-flex align-items-center gap-2">
            <CFormInput
              type="text"
              placeholder="Search ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
              className="app-subheader__search-input"
            />
            <CButton color="secondary" size="sm" onClick={handleClearFilters}>
              Clear
            </CButton>
          </div>
        </CCol>
      </CRow>

      {!!columnOptions.length && (
        <CRow className="mt-3">
          <Collapse ghost size="small" expandIconPosition="end">
            <Panel
              key="1"
              header={
                <span className="app-subheader__advanced-title text-secondary fw-semibold">
                  Select Column
                </span>
              }
            >
              <div className="app-subheader__column-tags">
                {columnOptions.map((column) => {
                  const isActive = activeColumnKeys.includes(column.key)
                  return (
                    <CheckableTag
                      key={column.key}
                      checked={isActive}
                      onChange={() => handleColumnToggle(column.key)}
                      className={`app-subheader__column-tag${isActive ? ' is-active' : ''}`}
                    >
                      {column.label}
                    </CheckableTag>
                  )
                })}
              </div>
            </Panel>
          </Collapse>
        </CRow>
      )}
    </CCard>
  )
}

export default AppSubHeaderStock
