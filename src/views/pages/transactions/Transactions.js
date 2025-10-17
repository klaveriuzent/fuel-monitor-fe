/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Table } from 'antd'
import { CCard, CCardBody, CButton } from '@coreui/react'
import { transactionColumns } from './interface.transactions'
import AppSubHeader from '../../../components/subheader/AppSubHeader'

const Transactions = () => {
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')

  const dataSource = [
    {
      key: '1',
      site: 'Jakarta',
      product: 'BIO SOLAR',
      date: '2025-09-01',
      asset: 'Truck A1',
      status: 'Completed',
      volume: 1200,
      kilometer: 350,
      stock: 5000,
    },
    {
      key: '2',
      site: 'Bandung',
      product: 'BIO SOLAR',
      date: '2025-09-02',
      asset: 'Truck B2',
      status: 'Pending',
      volume: 800,
      kilometer: 220,
      stock: 4200,
    },
    {
      key: '3',
      site: 'Medan',
      product: 'BIO SOLAR',
      date: '2025-09-03',
      asset: 'Truck C3',
      status: 'Cancelled',
      volume: 600,
      kilometer: 150,
      stock: 3900,
    },
  ]

  // filter data berdasarkan search dan site
  const filteredData = dataSource.filter((item) => {
    const matchesText =
      item.site.toLowerCase().includes(search.toLowerCase()) ||
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.asset.toLowerCase().includes(search.toLowerCase())

    const matchesSite =
      siteFilter === 'all'
        ? true
        : item.site.toLowerCase() === siteFilter.toLowerCase()

    return matchesText && matchesSite
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
      {/* Filter Section */}
      <AppSubHeader
        search={search}
        setSearch={setSearch}
        siteFilter={siteFilter}
        setSiteFilter={setSiteFilter}
      />

      {/* Table Section */}
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