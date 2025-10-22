/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { DatePicker, Collapse, Radio } from 'antd'
import { CCard, CRow, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react'
import axios from 'axios'

const { RangePicker } = DatePicker
const { Panel } = Collapse

const AppSubHeader = ({ search, setSearch, siteFilter, setSiteFilter, dateRange, setDateRange }) => {
  const filterGroup = useSelector((state) => state.filterGroup)
  const [siteOptions, setSiteOptions] = useState([])
  const [quickRange, setQuickRange] = useState('today')

  const baseURL = import.meta.env.VITE_API_BASE_URL

  const calculateQuickRange = useCallback((value) => {
    const today = dayjs()

    switch (value) {
      case 'today':
        return [today.startOf('day'), today.endOf('day')]
      case 'last7':
        return [today.subtract(6, 'day').startOf('day'), today.endOf('day')]
      case 'last30':
        return [today.subtract(29, 'day').startOf('day'), today.endOf('day')]
      case 'last180':
        return [today.subtract(179, 'day').startOf('day'), today.endOf('day')]
      case 'last365':
        return [today.subtract(364, 'day').startOf('day'), today.endOf('day')]
      default:
        return [today.startOf('day'), today.endOf('day')]
    }
  }, [])

  const fetchSites = useCallback(async () => {
    try {
      let url = `${baseURL}/site`
      if (filterGroup && filterGroup !== 'all') {
        url = `${baseURL}/site?id_location=${filterGroup}`
      }

      const res = await axios.get(url)
      if (res.data && Array.isArray(res.data.data)) {
        setSiteOptions(res.data.data)
      } else {
        setSiteOptions([])
      }
    } catch (error) {
      setSiteOptions([])
    }
  }, [baseURL, filterGroup])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  useEffect(() => {
    if (!quickRange) {
      return
    }

    const [start, end] = calculateQuickRange(quickRange)
    setDateRange([start, end])
  }, [calculateQuickRange, quickRange, setDateRange])

  useEffect(() => {
    setSiteFilter('all')
  }, [filterGroup, setSiteFilter])

  const handleClearFilters = () => {
    setSearch('')
    setSiteFilter('all')
    setQuickRange('today')
  }

  const handleRangePickerChange = (dates) => {
    setDateRange(dates)
    setQuickRange(null)
  }

  return (
    <CCard className="mb-3 p-3">
      <CRow className="align-items-center g-2">
        <CCol xs={12} sm={6} md={3}>
          <CFormSelect size="sm" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
            <option value="all">All Sites</option>
            {siteOptions.map((site) => (
              <option key={site.id} value={site.id_site}>
                {site.id_site}
              </option>
            ))}
          </CFormSelect>
        </CCol>

        <CCol xs={12} sm={12} md={6}>
          <div className="d-flex align-items-center gap-2" style={{ width: '100%' }}>
            <CFormInput
              type="text"
              placeholder="Search ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
              style={{ flexGrow: 1 }}
            />
            <CButton color="secondary" size="sm" onClick={handleClearFilters}>
              Clear
            </CButton>
          </div>
        </CCol>
      </CRow>

      <CRow className="mt-3">
        <CCol>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="fw-semibold text-nowrap">Select Date</span>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              size="small"
              value={quickRange || undefined}
              onChange={(e) => setQuickRange(e.target.value)}
            >
              <Radio.Button value="today">Today</Radio.Button>
              <Radio.Button value="last7">Last Week</Radio.Button>
              <Radio.Button value="last30">Last Month</Radio.Button>
              <Radio.Button value="last180">Last 6 Months</Radio.Button>
              <Radio.Button value="last365">Last Year</Radio.Button>
            </Radio.Group>
          </div>
        </CCol>
      </CRow>

      <CRow className="mt-3">
        <Collapse ghost size="small">
          <Panel header="Advanced Filter" key="1">
            <div className="ps-2">
              <RangePicker
                size="middle"
                value={dateRange}
                onChange={handleRangePickerChange}
                style={{ width: '100%' }}
                allowClear
                format="DD MMM YYYY"
                disabledDate={(current) => current && current > dayjs().endOf('day').add(1, 'year')}
              />
            </div>
          </Panel>
        </Collapse>
      </CRow>
    </CCard>
  )
}

export default AppSubHeader
