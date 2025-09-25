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
import { fuelReceiveColumns } from './interface.fuelreceive'

const FuelReceive = () => {
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('all')

  const dataSource = [
    {
      key: '1',
      tankId: 'Tank_A1',
      date: '2025-09-01',
      initialOil: 5000,
      totalRequest: 2000,
      totalDelivery: 1950,
      losses: 50,
      finalOil: 6950,
    },
    {
      key: '2',
      tankId: 'Tank_B2',
      date: '2025-09-02',
      initialOil: 6000,
      totalRequest: 1500,
      totalDelivery: 1500,
      losses: 0,
      finalOil: 7500,
    },
    {
      key: '3',
      tankId: 'Tank_C3',
      date: '2025-09-03',
      initialOil: 7000,
      totalRequest: 1800,
      totalDelivery: 1780,
      losses: 20,
      finalOil: 8780,
    },
  ]

  // filter data
  const filteredData = dataSource.filter((item) => {
    const matchesText = item.tankId.toLowerCase().includes(search.toLowerCase())
    const matchesDate =
      filterDate === 'all' ? true : item.date === filterDate
    return matchesText && matchesDate
  })

  const columns = fuelReceiveColumns.map((col) =>
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
          {/* Search Tank ID */}
          <CCol xs={12} sm={5} md={4}>
            <CFormInput
              type="text"
              placeholder="Search by Tank ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
            />
          </CCol>

          {/* Date Filter */}
          <CCol xs={12} sm={4} md={3}>
            <CFormSelect
              size="sm"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="2025-09-01">2025-09-01</option>
              <option value="2025-09-02">2025-09-02</option>
              <option value="2025-09-03">2025-09-03</option>
            </CFormSelect>
          </CCol>

          {/* Clear Button */}
          <CCol xs="auto">
            <CButton
              color="secondary"
              size="sm"
              onClick={() => {
                setSearch('')
                setFilterDate('all')
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

export default FuelReceive