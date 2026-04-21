import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { DatePicker, Collapse, Tag, AutoComplete } from 'antd'
import { CCard, CRow, CCol, CButton } from '@coreui/react'
import axios from 'axios'

import './AppSubHeader.scss'

const DEFAULT_STORAGE_KEY = 'app-subheader-filters'
const { RangePicker } = DatePicker
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
  const [quickRange, setQuickRange] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return 'today'

    try {
      const parsed = JSON.parse(saved)
      return parsed?.quickRange || 'today'
    } catch {
      return 'today'
    }
  })
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
        const [start, end] = calculateQuickRange(quickRange)
        setDateRange([start, end])
      } else if (dateRange) {
        setDateRange(dateRange.map((d) => dayjs(d)))
      }
    } else {
      const [start, end] = calculateQuickRange('today')
      setDateRange([start, end])
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

  const handleClearSiteFilter = () => {
    setSiteFilter('all')
    setSiteInputValue('All Sites')
  }

  return (
    <CCard className="app-subheader mb-3 p-3">
      {/* Filter Row */}
      <CRow className="align-items-center g-2">
        <CCol xs={12}>
          <div className="app-subheader__search d-flex align-items-center gap-2">
            <AutoComplete
              size="small"
              className="app-subheader__site-autocomplete"
              value={siteInputValue}
              options={siteAutoCompleteOptions}
              onSelect={handleSiteSelect}
              onChange={(value) => {
                setSiteInputValue(value)
                if (!value) {
                  setSiteFilter('all')
                }
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
            <CButton color="secondary" size="sm" onClick={handleClearSiteFilter}>
              Clear
            </CButton>
          </div>
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
