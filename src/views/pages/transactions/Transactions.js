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
      id_site: 'SIMP_SIMP_Balam_Estate',
      id_product: '1',
      waktu: '2025-09-30T08:36:48Z',
      id_nozzle: '1',
      status: 'online',
      volume: 19.0,
      odometer: 342466,
      volume_minyak_atg: 3474.47,
    },
    {
      key: '2',
      id_site: 'SIMP_SIMP_Talang_Estate',
      id_product: '2',
      waktu: '2025-09-30T09:12:22Z',
      id_nozzle: '2',
      status: 'online',
      volume: 25.5,
      odometer: 285012,
      volume_minyak_atg: 4210.3,
    },
    {
      key: '3',
      id_site: 'SIMP_SIMP_Sawit_Estate',
      id_product: '1',
      waktu: '2025-09-30T10:45:10Z',
      id_nozzle: '3',
      status: 'offline',
      volume: 17.8,
      odometer: 312879,
      volume_minyak_atg: 2890.75,
    },
  ]

  // filter data berdasarkan search, site, dan rentang tanggal
  const filteredData = dataSource.filter((item) => {
    const matchesText =
      item.id_site.toLowerCase().includes(search.toLowerCase()) ||
      item.id_product.toLowerCase().includes(search.toLowerCase()) ||
      item.id_nozzle.toLowerCase().includes(search.toLowerCase())

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
          <Table
            dataSource={filteredData}
            columns={columns}
            pagination={true}
            scroll={{ x: 'max-content' }}
            bordered
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default Transactions
