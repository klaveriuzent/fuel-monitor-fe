/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Row, Col, Pagination, Tag, Progress } from 'antd'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CRow,
  CCol,
  CFormInput,
  CButton,
} from '@coreui/react'

const generateData = () =>
  Array.from({ length: 100 }, (_, i) => ({
    id: `Tank ${String(i + 1).padStart(3, '0')}`,
    type: ['Diesel', 'Pertalite', 'Pertamax'][i % 3],
    site: `Site ${String.fromCharCode(65 + (i % 5))}`,
    status: ['Normal', 'Warning', 'Critical'][i % 3],
    fuelLevel: Math.floor(Math.random() * 8000),
    waterLevel: Math.floor(Math.random() * 1000),
    capacity: 8000,
    fuelPercentage: Math.floor(Math.random() * 100),
    waterPercentage: Math.floor(Math.random() * 10),
    totalPercentage: Math.floor(Math.random() * 100),
    lastUpdated: '2025-09-0' + ((i % 3) + 1),
    usageRate: ['Low', 'Medium', 'High'][i % 3],
  }))

const FuelStock = () => {
  const data = generateData()

  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('')

  const pageSize = 12

  // Filter logic
  const filteredData = data.filter((item) => {
    const matchSearch = item.id.toLowerCase().includes(search.toLowerCase())
    const matchSite =
      filterSite === '' || item.site.toLowerCase().includes(filterSite.toLowerCase())
    return matchSearch && matchSite
  })

  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  return (
    <div>
      {/* Filter Section */}
      <CCard className="mb-3 p-3">
        <CRow className="align-items-center g-2">
          {/* Search Tank ID */}
          <CCol xs={12} sm={5} md={4}>
            <CFormInput
              type="text"
              placeholder="Search by Tank ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              size="sm"
            />
          </CCol>

          {/* Filter by Site */}
          <CCol xs={12} sm={4} md={3}>
            <CFormInput
              type="text"
              placeholder="Filter by Site..."
              value={filterSite}
              onChange={(e) => {
                setFilterSite(e.target.value)
                setCurrentPage(1)
              }}
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
                setFilterSite('')
                setCurrentPage(1)
              }}
            >
              Clear
            </CButton>
          </CCol>
        </CRow>
      </CCard>

      {/* Pagination atas */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          responsive
          simple
        />
      </div>

      {/* Grid Card */}
      <Row gutter={[16, 16]}>
        {paginatedData.map((item) => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <CCard className="shadow-sm h-full" style={{ height: '100%' }}>
              <CCardBody style={{ padding: '12px' }}>
                <CCardTitle style={{ fontSize: '1rem', marginBottom: '8px' }}>
                  {item.id}
                </CCardTitle>
                <CCardText style={{ fontSize: '0.85rem' }}>
                  <b>Type:</b> {item.type} <br />
                  <b>Site:</b> {item.site} <br />
                  <b>Status:</b>{' '}
                  <Tag
                    color={
                      item.status === 'Normal'
                        ? 'green'
                        : item.status === 'Warning'
                        ? 'orange'
                        : 'red'
                    }
                  >
                    {item.status}
                  </Tag>
                  <br />
                  <b>Fuel Level:</b> {item.fuelLevel} L / {item.capacity} L
                  <Progress
                    percent={item.fuelPercentage}
                    strokeColor={{
                      '0%': '#DC2626', // merah
                      '100%': '#F59E0B', // kuning
                    }}
                    size="small"
                  />
                  <b>Water Level:</b> {item.waterLevel} L
                  <Progress
                    percent={item.waterPercentage}
                    strokeColor="#3B82F6"
                    size="small"
                  />
                  <b>Total:</b> {item.totalPercentage}% <br />
                  <b>Usage:</b> {item.usageRate} <br />
                  <small>{item.lastUpdated}</small>
                </CCardText>
              </CCardBody>
            </CCard>
          </Col>
        ))}
      </Row>

      {/* Pagination bawah */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          responsive
          simple
        />
      </div>
    </div>
  )
}

export default FuelStock