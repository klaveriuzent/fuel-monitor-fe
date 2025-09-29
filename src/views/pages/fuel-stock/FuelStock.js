import React, { useState } from 'react'
import { Row, Col, Pagination, Badge } from 'antd'
import {
  CFormInput,
  CButton,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CRow,
  CCol,
} from '@coreui/react'

// Generator data dummy
const generateData = () =>
  Array.from({ length: 100 }, (_, i) => {
    const tankVolume = 8000
    const tankHeight = 300
    return {
      id: `Tank ${String(i + 1).padStart(3, '0')}`,
      type: ['Diesel', 'Pertalite', 'Pertamax'][i % 3],
      site: `Site ${String.fromCharCode(65 + (i % 5))}`,
      status: ['Online', 'Offline'][i % 2],
      fuelLevel: Math.floor(Math.random() * tankVolume),
      waterLevel: Math.floor(Math.random() * 1000),
      capacity: tankVolume,
      tankHeight,
      tankVolume,
      lastUpdated: '2025-09-0' + ((i % 3) + 1),
    }
  })

// Tank visual (sama seperti sebelumnya)
const TankVisual = ({ fuelLevel, waterLevel, capacity }) => {
  const fuelPercent = (fuelLevel / capacity) * 100
  const waterPercent = (waterLevel / capacity) * 100
  const topHeight = Math.max(fuelPercent, waterPercent)
  const bottomHeight = Math.min(fuelPercent, waterPercent)
  const topColor = fuelPercent >= waterPercent ? '#F59E0B' : '#3B82F6'
  const bottomColor = fuelPercent >= waterPercent ? '#3B82F6' : '#F59E0B'

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '160px',
    border: '2px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column-reverse',
  }
  const layerStyle = (height, color) => ({
    width: '100%',
    height: `${height}%`,
    background: color,
    transition: 'height 0.5s',
  })
  const markerStyle = (percent) => ({
    position: 'absolute',
    bottom: `${percent}%`,
    left: 0,
    width: '100%',
    height: '1px',
    background: '#555',
    opacity: 0.4,
  })

  return (
    <div style={containerStyle}>
      <div style={markerStyle(25)}></div>
      <div style={markerStyle(50)}></div>
      <div style={markerStyle(75)}></div>
      <div style={layerStyle(bottomHeight, bottomColor)}></div>
      <div style={layerStyle(topHeight - bottomHeight, topColor)}></div>
    </div>
  )
}

const TankWithScale = ({ fuelLevel, waterLevel, capacity }) => {
  const scaleNumbers = [25, 50, 75]
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center', // ⬅️ bikin semua konten center
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      {/* 3 div di kiri */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '160px',
          width: '50px',
          marginRight: '12px',
        }}
      >
        {['#FBBF24', '#34D399', '#60A5FA'].map((color, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: color,
              borderRadius: '4px',
              marginBottom: i < 2 ? '6px' : 0,
              textAlign: 'center',
              fontSize: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Div {i + 1}
          </div>
        ))}
      </div>

      {/* Tank visual */}
      <div style={{ width: '45%' }}>
        <TankVisual fuelLevel={fuelLevel} waterLevel={waterLevel} capacity={capacity} />
      </div>

      {/* Scale numbers */}
      <div
        style={{
          position: 'relative',
          height: '160px',
          width: '40px',
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

      <Row gutter={[16, 16]}>
        {paginatedData.map((item) => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <Badge.Ribbon text={item.status} color={item.status === 'Online' ? 'green' : 'red'}>
              <CCard className="shadow-sm h-full" style={{ height: '100%' }}>
                <CCardBody style={{ padding: '12px' }}>
                  <CCardTitle style={{ fontSize: '1rem', marginBottom: '8px' }}>
                    {item.id}
                  </CCardTitle>
                  <CCardText style={{ fontSize: '0.85rem' }}>
                    <b>Type:</b> {item.type} <br />
                    <b>Site:</b> {item.site} <br />
                    <b>Tank Height:</b> {item.tankHeight} cm <br />
                    <b>Tank Volume:</b> {item.tankVolume} L
                  </CCardText>

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
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>

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
