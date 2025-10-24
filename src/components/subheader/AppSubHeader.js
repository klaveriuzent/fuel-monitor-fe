import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { DatePicker, Collapse, Tag } from 'antd'
import { CCard, CRow, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react'
import axios from 'axios'

import './AppSubHeader.scss'
import { getColumnKey } from '../../utils/table'

const { RangePicker } = DatePicker
const { Panel } = Collapse
const { CheckableTag } = Tag

const AppSubHeader = ({
  search,
  setSearch,
  siteFilter,
  setSiteFilter,
  dateRange,
  setDateRange,
  columns = [],
  visibleColumnKeys,
  setVisibleColumnKeys,
  storageKey = 'appSubHeaderFilters',
}) => {
  const filterGroup = useSelector((state) => state.filterGroup)
  const [siteOptions, setSiteOptions] = useState([])
  const [quickRange, setQuickRange] = useState('today')
  const baseURL = import.meta.env.VITE_API_BASE_URL

  const quickRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Last Week', value: 'last7' },
    { label: 'Last Month', value: 'last30' },
    { label: 'Last 6 Months', value: 'last180' },
    { label: 'Last Year', value: 'last365' },
  ]

  const calculateQuickRange = useCallback((value) => {
    const today = dayjs()
    const ranges = {
      today: [today.startOf('day'), today.endOf('day')],
      last7: [today.subtract(6, 'day').startOf('day'), today.endOf('day')],
      last30: [today.subtract(29, 'day').startOf('day'), today.endOf('day')],
      last180: [today.subtract(179, 'day').startOf('day'), today.endOf('day')],
      last365: [today.subtract(364, 'day').startOf('day'), today.endOf('day')],
    }
    return ranges[value] || ranges.today
  }, [])

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
    const normalizeLabel = (column, fallback) => {
      const { title } = column || {}

      if (typeof title === 'string' || typeof title === 'number') {
        return String(title)
      }

      if (React.isValidElement(title)) {
        const child = title.props?.children
        if (typeof child === 'string' || typeof child === 'number') {
          return String(child)
        }
      }

      if (Array.isArray(title)) {
        return title.filter(Boolean).join(' ')
      }

      return fallback
    }

    return columns
      .map((column) => {
        const key = getColumnKey(column)
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

  const resolvedStorageKey = useMemo(
    () => storageKey || 'appSubHeaderFilters',
    [storageKey],
  )

  useEffect(() => {
    const savedRaw = localStorage.getItem(resolvedStorageKey)
    if (savedRaw) {
      let parsed
      try {
        parsed = JSON.parse(savedRaw)
      } catch (error) {
        parsed = null
      }

      if (parsed) {
        const {
          search: savedSearch,
          siteFilter: savedSiteFilter,
          quickRange: savedQuickRange,
          dateRange: savedDateRange,
          visibleColumnKeys: savedVisible,
          availableColumnKeys: savedAvailable,
        } = parsed

        if (savedSearch !== undefined) setSearch(savedSearch)
        if (savedSiteFilter !== undefined) setSiteFilter(savedSiteFilter)
        if (savedQuickRange) {
          setQuickRange(savedQuickRange)
          const [start, end] = calculateQuickRange(savedQuickRange)
          setDateRange([start, end])
        } else if (Array.isArray(savedDateRange)) {
          setDateRange(savedDateRange.map((d) => (d ? dayjs(d) : null)))
        }

        if (Array.isArray(savedVisible) && setVisibleColumnKeys) {
          const savedAvailableArray = Array.isArray(savedAvailable) ? savedAvailable : null
          const validSaved = savedVisible.filter((key) => availableColumnKeys.includes(key))
          const missingColumns = availableColumnKeys.filter(
            (key) =>
              !validSaved.includes(key) && !(savedAvailableArray?.includes(key) ?? false),
          )

          let nextColumns
          if (savedVisible.length === 0) {
            nextColumns = savedAvailableArray?.length ? [] : availableColumnKeys
          } else {
            const nextSet = new Set([...validSaved, ...missingColumns])
            nextColumns = availableColumnKeys.filter((key) => nextSet.has(key))
          }

          if (nextColumns.length || savedVisible.length === 0) {
            setVisibleColumnKeys((prev = []) =>
              areArraysEqual(prev, nextColumns) ? prev : nextColumns,
            )
          } else if (availableColumnKeys.length) {
            setVisibleColumnKeys((prev = []) =>
              areArraysEqual(prev, availableColumnKeys) ? prev : availableColumnKeys,
            )
          }
        }
      }
    } else {
      const [start, end] = calculateQuickRange('today')
      setDateRange([start, end])
      setQuickRange('today')

      if (setVisibleColumnKeys && availableColumnKeys.length) {
        setVisibleColumnKeys((prev = []) =>
          prev.length ? prev : availableColumnKeys,
        )
      }
    }
  }, [
    calculateQuickRange,
    setSearch,
    setSiteFilter,
    setDateRange,
    setVisibleColumnKeys,
    availableColumnKeys,
    areArraysEqual,
    resolvedStorageKey,
  ])

  useEffect(() => {
    const filters = {
      search,
      siteFilter,
      quickRange,
      dateRange: dateRange?.map((d) => (d ? d.toISOString() : null)),
      visibleColumnKeys: Array.isArray(activeColumnKeys)
        ? activeColumnKeys
        : availableColumnKeys,
      availableColumnKeys,
    }
    localStorage.setItem(resolvedStorageKey, JSON.stringify(filters))
  }, [
    search,
    siteFilter,
    quickRange,
    dateRange,
    activeColumnKeys,
    availableColumnKeys,
    resolvedStorageKey,
  ])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const handleClearFilters = () => {
    setSearch('')
    setSiteFilter('all')
    setQuickRange('today')

    const [start, end] = calculateQuickRange('today')
    setDateRange([start, end])
    if (setVisibleColumnKeys && availableColumnKeys.length) {
      setVisibleColumnKeys(availableColumnKeys)
    }
    localStorage.removeItem(resolvedStorageKey)
  }

  const handleQuickRangeToggle = (value) => {
    if (quickRange === value) {
      setQuickRange(null)
      setDateRange(null)
    } else {
      setQuickRange(value)
      const [start, end] = calculateQuickRange(value)
      setDateRange([start, end])
    }
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
      {/* Filter Row */}
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

      {/* Quick Range */}
      <CRow className="mt-3">
        <CCol>
          <div className="d-flex flex-column gap-2">
            <span className="app-subheader__quick-label text-nowrap text-secondary">
              Select Range Date
            </span>

            <div className="app-subheader__quick-tags">
              {quickRangeOptions.map((option) => (
                <CheckableTag
                  key={option.value}
                  checked={quickRange === option.value}
                  onChange={() => handleQuickRangeToggle(option.value)}
                  className={`app-subheader__quick-tag${
                    quickRange === option.value ? ' is-active' : ''
                  }`}
                >
                  {option.label}
                </CheckableTag>
              ))}
            </div>
          </div>
        </CCol>
      </CRow>

      {/* Advanced Filter */}
      <CRow className="mt-3">
        <Collapse ghost size="small" expandIconPosition="end">
          <Panel
            key="1"
            header={
              <span className="app-subheader__advanced-title text-secondary fw-semibold">
                Advanced Filter
              </span>
            }
          >
            <div className="app-subheader__range-label mb-1 text-secondary fw-semibold">
              Range Date
            </div>
            <div className="app-subheader__range-picker">
              <RangePicker
                size="middle"
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates)
                  setQuickRange(null)
                }}
                className="app-subheader__range-picker ant-range-custom"
                allowClear
                format="DD MMM YYYY"
                style={{ width: '100%', marginLeft: '12px' }}
                disabledDate={(current) => current && current > dayjs().endOf('day').add(1, 'year')}
              />
            </div>
            <div className="app-subheader__range-label mt-3 mb-1 text-secondary fw-semibold">
              Select Column
            </div>
            <div className="app-subheader__column-tags">
              {columnOptions.map((column) => {
                const isActive = activeColumnKeys.includes(column.key)
                return (
                  <CheckableTag
                    key={column.key}
                    checked={isActive}
                    onChange={() => handleColumnToggle(column.key)}
                    className={`app-subheader__column-tag${
                      isActive ? ' is-active' : ''
                    }`}
                  >
                    {column.label}
                  </CheckableTag>
                )
              })}
              {!columnOptions.length && (
                <span className="text-secondary small">No columns available</span>
              )}
            </div>
          </Panel>
        </Collapse>
      </CRow>
    </CCard>
  )
}

export default AppSubHeader
