/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Table } from 'antd'
import {
  CCard,
  CCardBody,
  CButton,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'
import { transactionColumns } from './interface.transactions'

const Transactions = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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

  // filter data
  const filteredData = dataSource.filter((item) => {
    const matchesText =
      item.site.toLowerCase().includes(search.toLowerCase()) ||
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.asset.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : item.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesText && matchesStatus
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
      <CCard className="mb-3 p-3">
        <CRow className="align-items-center g-2">
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

          {/* Status Filter */}
          <CCol xs={12} sm={4} md={3}>
            <CFormSelect
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </CFormSelect>
          </CCol>

          {/* Clear Button */}
          <CCol xs="auto">
            <CButton
              color="secondary"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
              }}
            >
              Clear
            </CButton>
          </CCol>
        </CRow>
      </CCard>

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