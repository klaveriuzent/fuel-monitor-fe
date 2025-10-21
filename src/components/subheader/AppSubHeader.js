/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { DatePicker } from 'antd'
import { CCard, CRow, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react'
import axios from 'axios'

const { RangePicker } = DatePicker

const AppSubHeader = ({
    search,
    setSearch,
    siteFilter,
    setSiteFilter,
    dateRange,
    setDateRange,
}) => {
    const filterGroup = useSelector((state) => state.filterGroup)
    const [siteOptions, setSiteOptions] = useState([])

    const baseURL = import.meta.env.VITE_API_BASE_URL

    const fetchSites = useCallback(async () => {
        try {
            let url = `${baseURL}/site`
            if (filterGroup && filterGroup !== 'all') {
                url = `${baseURL}/site?id_location=${filterGroup}`
            }

            console.log('🔄 Fetching from:', url)
            const res = await axios.get(url)
            if (res.data && Array.isArray(res.data.data)) {
                setSiteOptions(res.data.data)
            } else {
                setSiteOptions([])
            }
        } catch (error) {
            console.error('❌ Error fetching site list:', error)
            setSiteOptions([])
        }
    }, [baseURL, filterGroup])

    useEffect(() => {
        fetchSites()
    }, [fetchSites])

    useEffect(() => {
        setDateRange([dayjs(), null])
    }, [setDateRange])

    useEffect(() => {
        setSiteFilter('all')
    }, [filterGroup, setSiteFilter])

    return (
        <CCard className="mb-3 p-3">
            <CRow className="align-items-center g-2">
                {/* Site Filter */}
                <CCol xs={12} sm={5} md={3}>
                    <CFormSelect
                        size="sm"
                        value={siteFilter}
                        onChange={(e) => setSiteFilter(e.target.value)}
                    >
                        <option value="all">All Sites</option>
                        {siteOptions.map((site) => (
                            <option key={site.id} value={site.id_site}>
                                {site.id_site}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>

                {/* Date Range Filter */}
                <CCol xs={12} sm={5} md={3}>
                    <RangePicker
                        size="medium"
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        style={{ width: '100%' }}
                        allowClear
                        format="DD MMM YYYY"
                        disabledDate={(current) =>
                            current && current > dayjs().endOf('day').add(1, 'year')
                        }
                    />
                </CCol>

                {/* Search */}
                <CCol xs={12} sm={5} md={5}>
                    <CFormInput
                        type="text"
                        placeholder="Search by Site / Product / Asset..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="sm"
                    />
                </CCol>

                {/* Clear Button */}
                <CCol xs="auto">
                    <CButton
                        color="secondary"
                        size="sm"
                        onClick={() => {
                            setSearch('')
                            setSiteFilter('all')
                            setDateRange([dayjs(), null])
                        }}
                    >
                        Clear
                    </CButton>
                </CCol>
            </CRow>
        </CCard>
    )
}

export default AppSubHeader
