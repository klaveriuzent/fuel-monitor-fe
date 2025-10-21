/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Table } from 'antd'
import { CCard, CCardBody, CButton } from '@coreui/react'
import { transactionColumns } from './interface.transactions'
import AppSubHeader from '../../../components/subheader/AppSubHeader'

const Transactions = () => {
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)

  const dataSource = [
    {
      key: '1',
      id_card: 'ID-001',
      odometer: 342466,
      id_site: 'SIMP_SIMP_Balam_Estate',
      plat: 'BM 1234 XX',
      username: 'operator-01',
      waktu: '2025-09-30T08:36:48Z',
      volume: 19.0,
      unit_price: 6800,
    },
    {
      key: '2',
      id_card: 'ID-002',
      odometer: 298754,
      id_site: 'SIMP_SIMP_Talang_Estate',
      plat: 'BM 5678 YY',
      username: 'operator-02',
      waktu: '2025-10-02T11:22:15Z',
      volume: 22.5,
      unit_price: 6900,
    },
    {
      key: '3',
      id_card: 'ID-003',
      odometer: 365102,
      id_site: 'SIMP_SIMP_Sawit_Estate',
      plat: '',
      username: 'operator-03',
      waktu: '2025-10-05T06:54:03Z',
      volume: 17.25,
      unit_price: 7000,
    },
  ]

  // filter data berdasarkan search, site, dan rentang tanggal
  const filteredData = dataSource.filter((item) => {
    const matchesText = [
      item.id_site,
      item.id_card,
      item.plat,
      item.username,
      item.odometer,
      item.volume,
      item.unit_price,
    ].some(
      (field) =>
        field !== undefined &&
        field !== null &&
        field.toString().toLowerCase().includes(search.toLowerCase()),
    )

    const matchesSite =
      siteFilter === 'all'
        ? true
        : item.id_site.toLowerCase() === siteFilter.toLowerCase()

    const matchesDate =
      dateRange && dateRange[0] && dateRange[1]
        ? (() => {
          const [start, end] = dateRange
          const itemDate = new Date(item.waktu)
          const startDate = start.startOf('day').toDate()
          const endDate = end.endOf('day').toDate()
          return itemDate >= startDate && itemDate <= endDate
        })()
        : true

    return matchesText && matchesSite && matchesDate
  })

  const columns = transactionColumns.map((col) =>
    col.key === 'action'
      ? {
        ...col,
        render: (_, record) => (
          <CButton color="primary" size="sm">
            View
          </CButton>
        ),
      }
      : col
  )

  return (
    <>
      <AppSubHeader
        search={search}
        setSearch={setSearch}
        siteFilter={siteFilter}
        setSiteFilter={setSiteFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
            <CButton color="success" size="sm" className="text-white">
              <i className="bi bi-file-earmark-excel me-1"></i>
              Export to Excel
            </CButton>
          </div>

          <Table
            dataSource={filteredData}
            columns={columns}
            pagination
            scroll={{ x: 'max-content' }}
            bordered
          />
        </CCardBody>
      </CCard>

    </>
  )
}

export default Transactions
