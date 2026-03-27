import React, { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { DatePicker, Collapse, Tag } from 'antd'
import { CCard, CRow, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react'
import axios from 'axios'

import './AppSubHeader.scss'

const DEFAULT_STORAGE_KEY = 'app-subheader-filters'
const { RangePicker } = DatePicker
const { Panel } = Collapse
const { CheckableTag } = Tag

const AppSubHeaderDashboard = ({
  search,
  setSearch,
  siteFilter,
  setSiteFilter,
  dateRange,
  setDateRange,
  storageKey = DEFAULT_STORAGE_KEY,
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
    if (saved) {
      const { search, siteFilter, quickRange, dateRange } = JSON.parse(saved)

      if (search !== undefined) setSearch(search)
      if (siteFilter !== undefined) setSiteFilter(siteFilter)
      if (quickRange) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQuickRange(quickRange)
        const [start, end] = calculateQuickRange(quickRange)
        setDateRange([start, end])
      } else if (dateRange) {
        setDateRange(dateRange.map((d) => dayjs(d)))
      }
    } else {
      const [start, end] = calculateQuickRange('today')
      setDateRange([start, end])
      setQuickRange('today')
    }
  }, [calculateQuickRange, setSearch, setSiteFilter, setDateRange, storageKey])

  useEffect(() => {
    const filters = {
      search,
      siteFilter,
      quickRange,
      dateRange: dateRange?.map((d) => (d ? d.toISOString() : null)),
    }
    localStorage.setItem(storageKey, JSON.stringify(filters))
  }, [search, siteFilter, quickRange, dateRange, storageKey])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSites()
  }, [fetchSites])

  const handleClearFilters = () => {
    setSearch('')
    setSiteFilter('all')
    setQuickRange('today')

    const [start, end] = calculateQuickRange('today')
    setDateRange([start, end])

    localStorage.removeItem(storageKey)
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

  return (
    <CCard className="app-subheader mb-3 p-3">
      {/* Filter Row */}
      <CRow className="align-items-center g-2">
        <CCol xs={12} sm={12} md={12}>
          <CFormSelect size="sm" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
            <option value="all">All Sites</option>
            {siteOptions.map((site) => (
              <option key={site.id} value={site.id_site}>
                {site.id_site}
              </option>
            ))}
          </CFormSelect>
        </CCol>

        {/* <CCol xs={12} sm={12} md={8}>
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
        </CCol> */}
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
        {/* <Collapse ghost size="small" expandIconPlacement="end">
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
          </Panel>
        </Collapse> */}
        <Collapse
          ghost
          size="small"
          expandIconPlacement="end"
          items={[
            {
              key: '1',
              label: (
                <span className="app-subheader__advanced-title text-secondary fw-semibold">
                  Advanced Filter
                </span>
              ),
              children: (
                <>
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
                      disabledDate={(current) =>
                        current && current > dayjs().endOf('day').add(1, 'year')
                      }
                    />
                  </div>
                </>
              ),
            },
          ]}
        />
      </CRow>
    </CCard>
  )
}

export default AppSubHeaderDashboard
