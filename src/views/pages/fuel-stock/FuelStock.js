import React, { useState } from 'react'
import { Row, Col, Pagination, Badge } from 'antd'
import { FireOutlined, ExperimentOutlined } from '@ant-design/icons'
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
// Generator data dummy
const generateData = () =>
  Array.from({ length: 20 }, (_, i) => {
    const tankVolume = 8000
    const tankHeight = 300

    const fuelLevel = Math.floor(tankVolume * (0.5 + Math.random() * 0.45)) // 50–95%
    const waterLevel = Math.floor(Math.random() * (tankVolume * 0.1)) // 0–10%
    const temperature = (10 + Math.random() * 30).toFixed(1)
    const status = Math.random() < 0.8 ? 'Online' : 'Offline'

    // Random jam dan menit
    const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0')
    const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    const day = String((i % 3) + 1).padStart(2, '0')
    const lastUpdated = `2025-09-${day} ${hour}:${minute}`

    return {
      id: `Tank ${String(i + 1).padStart(3, '0')}`,
      type: ['Shell V-Power', 'Shell V-Power Nitro+', 'Shell Diesel'][i % 3],
      site: `Site ${String.fromCharCode(65 + (i % 5))}`,
      status,
      fuelLevel,
      waterLevel,
      capacity: tankVolume,
      tankHeight,
      tankVolume,
      temperature,
      lastUpdated,
    }
  })

// Tank visual
const TankVisual = ({ fuelLevel, waterLevel, capacity, showFuel, showWater }) => {
  const waterPercent = showWater ? (waterLevel / capacity) * 100 : 0
  const fuelPercent = showFuel ? (fuelLevel / capacity) * 100 : 0

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '160px',
    border: '2px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#f9f9f9',
  }

  // Water: tanpa animasi
  const waterStyle = {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: `${waterPercent}%`,
    background: '#3B82F6',
  }

  // Fuel: dengan animasi wave tipis
  const fuelStyle = {
    position: 'absolute',
    bottom: `${waterPercent}%`, // start dari atas water
    width: '200%',
    height: `${fuelPercent}%`,
    overflow: 'hidden',
    animation: 'waveMove 10s linear infinite',
  }

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes waveMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

      {/* Markers */}
      {[25, 50, 75].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            bottom: `${s}%`,
            left: 0,
            width: '100%',
            height: '1px',
            background: '#555',
            opacity: 0.3,
          }}
        />
      ))}

      {/* Water */}
      {showWater && waterPercent > 0 && <div style={waterStyle}></div>}

      {/* Fuel */}
      {showFuel && fuelPercent > 0 && (
        <div style={fuelStyle}>
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', fill: '#F59E0B', opacity: 0.7 }}
          >
            <path d="M0,30 C300,32 900,28 1200,30 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      )}
    </div>
  )
}

// Komponen Tank dengan toggle Fuel & Water
const TankWithScale = ({ fuelLevel, waterLevel, capacity, temperature }) => {
  const [showFuel, setShowFuel] = useState(true)
  const [showWater, setShowWater] = useState(true)
  const scaleNumbers = [25, 50, 75]

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '8px',
        marginLeft: '32px',
      }}
    >
      {/* 3 div kiri */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '160px',
          width: '40%',
          paddingTop: '4px',
          marginRight: '12px',
        }}
      >
        {/* Temperature */}
        <div
          style={{
            flex: 1,
            background: '#f9f9f9',
            border: '2px solid #ccc',
            borderRadius: '4px',
            marginBottom: '6px',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {temperature} °C
        </div>

        {/* Fuel toggle */}
        <div
          onClick={() => setShowFuel((p) => !p)}
          style={{
            flex: 1,
            background: showFuel ? '#fff3e0' : '#f9f9f9',
            border: '2px solid #ccc',
            borderRadius: '4px',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FireOutlined
              style={{
                fontSize: '1rem',
                marginTop: '4px',
                color: showFuel ? '#F59E0B' : '#aaa',
              }}
            />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                marginTop: '-4px',
              }}
            >
              Fuel
            </span>
          </div>
        </div>

        {/* Water toggle */}
        <div
          onClick={() => setShowWater((p) => !p)}
          style={{
            flex: 1,
            background: showWater ? '#e0f2fe' : '#f9f9f9',
            border: '2px solid #ccc',
            borderRadius: '4px',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ExperimentOutlined
              style={{
                fontSize: '1rem',
                marginTop: '4px',
                color: showWater ? '#3B82F6' : '#aaa',
              }}
            />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                marginTop: '-4px',
              }}
            >
              Water
            </span>
          </div>
        </div>
      </div>

      {/* Tank visual */}
      <div style={{ width: '45%' }}>
        <TankVisual
          fuelLevel={fuelLevel}
          waterLevel={waterLevel}
          capacity={capacity}
          showFuel={showFuel}
          showWater={showWater}
        />
      </div>

      {/* Scale kanan */}
      <div
        style={{
          position: 'relative',
          height: '160px',
          width: '40px',
          marginRight: '12px',
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
  const pageSize = 8

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
                    temperature={item.temperature}
                  />

                  <CCardText style={{ fontSize: '0.75rem', marginTop: '18px' }}>
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
