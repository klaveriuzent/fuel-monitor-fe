/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CCard, CRow, CCol, CFormInput, CFormSelect, CButton } from '@coreui/react'
import axios from 'axios'

const AppSubHeader = ({ search, setSearch, siteFilter, setSiteFilter }) => {
    const filterGroup = useSelector((state) => state.filterGroup)
    const [siteOptions, setSiteOptions] = useState([])

    const baseURL = import.meta.env.VITE_API_BASE_URL

    const fetchSites = useCallback(async () => {
        try {
            // Buat URL dasar
            let url = `${baseURL}/site`

            // Tambahkan query hanya kalau filterGroup valid dan bukan 'all'
            if (filterGroup && filterGroup !== 'all') {
                url = `${baseURL}/site?id_location=${filterGroup}`
            }

            console.log('🔄 Fetching from:', url)
            const res = await axios.get(url)

            // Pastikan format respon sesuai
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
        // Selalu panggil walau filterGroup = 'all'
        fetchSites()
    }, [fetchSites])

    useEffect(() => {
        setSiteFilter('all')
    }, [filterGroup, setSiteFilter])

    return (
        <CCard className="mb-3 p-3">
            <CRow className="align-items-center g-2">
                {/* Site Filter */}
                <CCol xs={12} sm={5} md={4}>
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

                {/* Search */}
                <CCol xs={12} sm={5} md={4}>
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
