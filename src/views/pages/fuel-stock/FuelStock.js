/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Row, Col, Pagination, Tag } from 'antd'
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

// Generator data dummy
const generateData = () =>
  Array.from({ length: 100 }, (_, i) => {
    const tankVolume = 8000 // kapasitas total liter
    const tankHeight = 300 // tinggi cm
    return {
      id: `Tank ${String(i + 1).padStart(3, '0')}`,
      type: ['Diesel', 'Pertalite', 'Pertamax'][i % 3],
      site: `Site ${String.fromCharCode(65 + (i % 5))}`,
      status: ['Normal', 'Warning', 'Critical'][i % 3],
      fuelLevel: Math.floor(Math.random() * tankVolume),
      waterLevel: Math.floor(Math.random() * 1000),
      capacity: tankVolume,
      tankHeight,
      tankVolume,
      lastUpdated: '2025-09-0' + ((i % 3) + 1),
    }
  })

// Komponen visual tank
const TankVisual = ({ fuelLevel, waterLevel, capacity }) => {
  const fuelPercent = Math.min((fuelLevel / capacity) * 100, 100)
  const waterPercent = Math.min((waterLevel / capacity) * 100, 100)

  const barStyle = {
    container: {
      position: 'relative',
      width: '100%',
      height: '160px',
      border: '2px solid #ccc',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#f9f9f9',
      display: 'flex',
      flexDirection: 'column-reverse',
    },
    fuel: {
      width: '100%',
      height: `${fuelPercent}%`,
      background: '#F59E0B', // fuel = orange
      transition: 'height 0.5s',
    },
    water: {
      width: '100%',
      height: `${waterPercent}%`,
      background: '#3B82F6', // water = biru
      transition: 'height 0.5s',
      opacity: 0.9,
    },
    marker: (percent) => ({
      position: 'absolute',
      bottom: `${percent}%`,
      left: 0,
      width: '100%',
      height: '1px',
      background: '#555',
      opacity: 0.4,
    }),
  }

  return (
    <div style={barStyle.container}>
      {/* Garis marker */}
      <div style={barStyle.marker(25)}></div>
      <div style={barStyle.marker(50)}></div>
      <div style={barStyle.marker(75)}></div>

      {/* Isi tank */}
      <div style={barStyle.water}></div>
      <div style={barStyle.fuel}></div>
    </div>
  )
}

// Wrapper untuk tank + skala di luar kanan
const TankWithScale = ({ fuelLevel, waterLevel, capacity }) => {
  const scaleNumbers = [25, 50, 75]

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
      {/* Tank Visual dengan lebar tetap */}
      <div style={{ width: '85%' }}>
        <TankVisual fuelLevel={fuelLevel} waterLevel={waterLevel} capacity={capacity} />
      </div>

      {/* Skala di sebelah kanan */}
      <div
        style={{
          position: 'relative',
          height: '160px',
          display: 'flex',
          flexDirection: 'column-reverse',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#333',
        }}
      >
        {scaleNumbers.map((s) => (
          <div
            key={s}
            style={{
              position: 'absolute',
              bottom: `${s}%`,
              transform: 'translateY(50%)',
            }}
          >
            {s}%
          </div>
        ))}
      </div>
    </div>
  )
}

const FuelStock = () => {
  const data = generateData()

  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('')

  const pageSize = 12

  // Filter data
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
                  <b>Tank Height:</b> {item.tankHeight} cm <br />
                  <b>Tank Volume:</b> {item.tankVolume} L
                </CCardText>

                {/* Visual Tank dengan skala di luar */}
                <TankWithScale
                  fuelLevel={item.fuelLevel}
                  waterLevel={item.waterLevel}
                  capacity={item.capacity}
                />

                <CCardText style={{ fontSize: '0.75rem', marginTop: '8px' }}>
                  <b>Fuel:</b> {item.fuelLevel} L<br />
                  <b>Water:</b> {item.waterLevel} L<br />
                  <small>Last Updated: {item.lastUpdated}</small>
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