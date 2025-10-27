import React, { useMemo, useState } from 'react'
import { Row, Col, Pagination, Badge, Tooltip } from 'antd'
import { FireOutlined, ExperimentOutlined } from '@ant-design/icons'
import { CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'

import AppSubHeaderStock from '../../../components/subheader/AppSubHeader.stock'

// Generator data dummy
const generateData = () =>
  Array.from({ length: 20 }, (_, i) => {
    const tankVolume = 8000
    const tankHeight = 300

    // Pastikan fuel + water tidak melebihi kapasitas
    const waterLevel = Math.floor(Math.random() * (tankVolume * 0.05)) // 0-5% untuk water
    const maxFuel = tankVolume - waterLevel
    const fuelLevel = Math.floor(maxFuel * (0.3 + Math.random() * 0.65)) // 30-95% dari sisa kapasitas

    const temperature = (15 + Math.random() * 25).toFixed(1) // 15-40°C lebih realistis
    const status = Math.random() < 0.85 ? 'Online' : 'Offline'

    // Generate tanggal dalam 7 hari terakhir
    const daysAgo = Math.floor(Math.random() * 7)
    const date = new Date('2025-09-30')
    date.setDate(date.getDate() - daysAgo)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')

    const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0')
    const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    const lastUpdated = `2025-${month}-${day} ${hour}:${minute}`

    return {
      id: `Tank ${String(i + 1).padStart(3, '0')}`,
      type: ['Shell V-Power', 'Shell V-Power Nitro+', 'Shell Diesel'][i % 3],
      site: `Site ${String.fromCharCode(65 + (i % 5))}`,
      status,
      fuelLevel,
      waterLevel,
      capacity: tankVolume,
      tankHeight,
      temperature,
      lastUpdated,
    }
  })

// Tank visual
const TankVisual = ({ fuelLevel, waterLevel, capacity, showFuel, showWater }) => {
  // Hitung persentase individual
  const waterPercent = (waterLevel / capacity) * 100
  const fuelPercent = (fuelLevel / capacity) * 100

  // Hitung tinggi visual berdasarkan toggle
  const waterHeight = showWater ? waterPercent : 0
  const fuelHeight = showFuel ? fuelPercent : 0

  // Total tinggi yang ditampilkan
  const totalHeight = waterHeight + fuelHeight
  const totalLiters = fuelLevel + waterLevel

  const tooltipContent = (
    <div>
      <div style={{ fontWeight: 'bold' }}>
        Total: {totalLiters.toLocaleString()}L / {capacity.toLocaleString()}L (
        {totalHeight.toFixed(1)}%)
      </div>
      {showFuel && (
        <div style={{ marginTop: '4px' }}>
          ⛽ Fuel: {fuelLevel.toLocaleString()}L ({fuelPercent.toFixed(1)}%)
        </div>
      )}
      {showWater && (
        <div>
          💧 Water: {waterLevel.toLocaleString()}L ({waterPercent.toFixed(1)}%)
        </div>
      )}
    </div>
  )

  return (
    <Tooltip title={tooltipContent} placement="top">
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '160px',
          border: '2px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#f9f9f9',
          cursor: 'pointer',
        }}
      >
        {[0, 25, 50, 75, 100].map((s) => (
          <div
            key={s}
            style={{
              position: 'absolute',
              bottom: `${s}%`,
              left: 0,
              width: '100%',
              height: '1px',
              background: '#555',
              opacity: s === 0 || s === 100 ? 0.5 : 0.3,
            }}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: `${waterHeight}%`,
            background: 'linear-gradient(to top, #3B82F6, #60A5FA)',
            opacity: 0.7,
            transition: 'height 0.6s ease-in-out',
            zIndex: 1,
          }}
        ></div>

        <div
          style={{
            position: 'absolute',
            bottom: `${waterHeight}%`,
            width: '100%',
            height: `${fuelHeight}%`,
            overflow: 'hidden',
            transition: 'height 0.6s ease-in-out, bottom 0.6s ease-in-out',
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to top, #F59E0B, #FBBF24)',
              opacity: 0.7,
            }}
          />
        </div>
      </div>
    </Tooltip>
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
        gap: '6px',
        marginLeft: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '160px',
          width: '60px',
          paddingTop: '4px',
          marginRight: '6px',
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#f9f9f9',
            border: '2px solid #ccc',
            borderRadius: '4px',
            marginBottom: '6px',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
          }}
        >
          {temperature} °C
        </div>

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
                marginTop: '2px',
                color: showFuel ? '#F59E0B' : '#aaa',
              }}
            />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                marginTop: '-2px',
              }}
            >
              Fuel
            </span>
          </div>
        </div>

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
                marginTop: '2px',
                color: showWater ? '#3B82F6' : '#aaa',
              }}
            />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                marginTop: '-2px',
              }}
            >
              Water
            </span>
          </div>
        </div>
      </div>

      <div style={{ width: 'calc(100% - 120px)', minWidth: '100px' }}>
        <TankVisual
          fuelLevel={fuelLevel}
          waterLevel={waterLevel}
          capacity={capacity}
          showFuel={showFuel}
          showWater={showWater}
        />
      </div>

      <div
        style={{
          position: 'relative',
          height: '160px',
          width: '40px',
          marginLeft: '4px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          fontSize: '0.65rem',
          color: '#333',
          fontWeight: '600',
          paddingTop: '20px',
          paddingBottom: '20px',
        }}
      >
        {scaleNumbers.reverse().map((s) => (
          <div
            key={s}
            style={{
              height: '0px',
              display: 'flex',
              alignItems: 'center',
              lineHeight: '1',
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
  const data = useMemo(() => generateData(), [])
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('all')
  const pageSize = 8

  const handleSearchChange = (value) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleSiteFilterChange = (value) => {
    setFilterSite(value)
    setCurrentPage(1)
  }

  const filteredData = data.filter((item) => {
    const matchSearch = item.id.toLowerCase().includes(search.toLowerCase())
    const matchSite =
      filterSite === 'all' || item.site.toLowerCase().includes(filterSite.toLowerCase())
    return matchSearch && matchSite
  })

  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  return (
    <div>
      <AppSubHeaderStock
        search={search}
        setSearch={handleSearchChange}
        siteFilter={filterSite}
        setSiteFilter={handleSiteFilterChange}
      />

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
                    <b>Capacity:</b> {item.capacity} L
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
