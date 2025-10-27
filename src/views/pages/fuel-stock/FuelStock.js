import React, { useCallback, useMemo, useState } from 'react'
import { Row, Col, Pagination } from 'antd'

import AppSubHeaderStock from '../../../components/subheader/AppSubHeader.stock'
import FuelCard from '../../../components/fuelcard/FuelCard'

// Static data source
const dataSource = [
  {
    id: 'Tank 001',
    type: 'Shell V-Power',
    site: 'Site A',
    status: 'Online',
    fuelLevel: 5200,
    waterLevel: 120,
    capacity: 8000,
    tankHeight: 300,
    temperature: '27.5',
    lastUpdated: '2025-09-30 08:15',
  },
  {
    id: 'Tank 002',
    type: 'Shell V-Power Nitro+',
    site: 'Site B',
    status: 'Online',
    fuelLevel: 6100,
    waterLevel: 90,
    capacity: 8000,
    tankHeight: 300,
    temperature: '29.1',
    lastUpdated: '2025-09-30 09:05',
  },
  {
    id: 'Tank 003',
    type: 'Shell Diesel',
    site: 'Site C',
    status: 'Online',
    fuelLevel: 4700,
    waterLevel: 150,
    capacity: 8000,
    tankHeight: 300,
    temperature: '26.4',
    lastUpdated: '2025-09-29 16:40',
  },
  {
    id: 'Tank 004',
    type: 'Shell V-Power',
    site: 'Site D',
    status: 'Offline',
    fuelLevel: 3100,
    waterLevel: 200,
    capacity: 8000,
    tankHeight: 300,
    temperature: '24.8',
    lastUpdated: '2025-09-28 11:55',
  },
  {
    id: 'Tank 005',
    type: 'Shell V-Power Nitro+',
    site: 'Site E',
    status: 'Online',
    fuelLevel: 6900,
    waterLevel: 80,
    capacity: 8000,
    tankHeight: 300,
    temperature: '30.2',
    lastUpdated: '2025-09-30 07:20',
  },
  {
    id: 'Tank 006',
    type: 'Shell Diesel',
    site: 'Site A',
    status: 'Online',
    fuelLevel: 5400,
    waterLevel: 110,
    capacity: 8000,
    tankHeight: 300,
    temperature: '28.0',
    lastUpdated: '2025-09-29 18:45',
  },
  {
    id: 'Tank 007',
    type: 'Shell V-Power',
    site: 'Site B',
    status: 'Online',
    fuelLevel: 5800,
    waterLevel: 95,
    capacity: 8000,
    tankHeight: 300,
    temperature: '27.9',
    lastUpdated: '2025-09-27 14:10',
  },
  {
    id: 'Tank 008',
    type: 'Shell V-Power Nitro+',
    site: 'Site C',
    status: 'Offline',
    fuelLevel: 2600,
    waterLevel: 180,
    capacity: 8000,
    tankHeight: 300,
    temperature: '23.7',
    lastUpdated: '2025-09-26 19:35',
  },
  {
    id: 'Tank 009',
    type: 'Shell Diesel',
    site: 'Site D',
    status: 'Online',
    fuelLevel: 6300,
    waterLevel: 70,
    capacity: 8000,
    tankHeight: 300,
    temperature: '29.5',
    lastUpdated: '2025-09-30 05:50',
  },
  {
    id: 'Tank 010',
    type: 'Shell V-Power',
    site: 'Site E',
    status: 'Online',
    fuelLevel: 7100,
    waterLevel: 65,
    capacity: 8000,
    tankHeight: 300,
    temperature: '31.0',
    lastUpdated: '2025-09-29 21:25',
  },
  {
    id: 'Tank 011',
    type: 'Shell V-Power Nitro+',
    site: 'Site A',
    status: 'Online',
    fuelLevel: 5600,
    waterLevel: 130,
    capacity: 8000,
    tankHeight: 300,
    temperature: '28.6',
    lastUpdated: '2025-09-28 08:05',
  },
  {
    id: 'Tank 012',
    type: 'Shell Diesel',
    site: 'Site B',
    status: 'Online',
    fuelLevel: 6000,
    waterLevel: 85,
    capacity: 8000,
    tankHeight: 300,
    temperature: '27.2',
    lastUpdated: '2025-09-27 17:55',
  },
  {
    id: 'Tank 013',
    type: 'Shell V-Power',
    site: 'Site C',
    status: 'Offline',
    fuelLevel: 2900,
    waterLevel: 210,
    capacity: 8000,
    tankHeight: 300,
    temperature: '24.2',
    lastUpdated: '2025-09-25 12:30',
  },
  {
    id: 'Tank 014',
    type: 'Shell V-Power Nitro+',
    site: 'Site D',
    status: 'Online',
    fuelLevel: 6400,
    waterLevel: 75,
    capacity: 8000,
    tankHeight: 300,
    temperature: '29.8',
    lastUpdated: '2025-09-28 15:45',
  },
  {
    id: 'Tank 015',
    type: 'Shell Diesel',
    site: 'Site E',
    status: 'Online',
    fuelLevel: 4800,
    waterLevel: 140,
    capacity: 8000,
    tankHeight: 300,
    temperature: '26.1',
    lastUpdated: '2025-09-26 07:50',
  },
  {
    id: 'Tank 016',
    type: 'Shell V-Power',
    site: 'Site A',
    status: 'Online',
    fuelLevel: 5900,
    waterLevel: 100,
    capacity: 8000,
    tankHeight: 300,
    temperature: '28.8',
    lastUpdated: '2025-09-30 06:40',
  },
  {
    id: 'Tank 017',
    type: 'Shell V-Power Nitro+',
    site: 'Site B',
    status: 'Online',
    fuelLevel: 6200,
    waterLevel: 90,
    capacity: 8000,
    tankHeight: 300,
    temperature: '27.7',
    lastUpdated: '2025-09-29 10:10',
  },
  {
    id: 'Tank 018',
    type: 'Shell Diesel',
    site: 'Site C',
    status: 'Online',
    fuelLevel: 5500,
    waterLevel: 115,
    capacity: 8000,
    tankHeight: 300,
    temperature: '26.9',
    lastUpdated: '2025-09-27 09:35',
  },
  {
    id: 'Tank 019',
    type: 'Shell V-Power',
    site: 'Site D',
    status: 'Offline',
    fuelLevel: 3000,
    waterLevel: 190,
    capacity: 8000,
    tankHeight: 300,
    temperature: '25.4',
    lastUpdated: '2025-09-25 18:20',
  },
  {
    id: 'Tank 020',
    type: 'Shell V-Power Nitro+',
    site: 'Site E',
    status: 'Online',
    fuelLevel: 6700,
    waterLevel: 85,
    capacity: 8000,
    tankHeight: 300,
    temperature: '30.5',
    lastUpdated: '2025-09-29 13:55',
  },
]

const FuelStock = () => {
  const data = useMemo(() => dataSource, [])
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('all')
  const pageSize = 8

  const handleSearchChange = useCallback(
    (value) => {
      setSearch(value)
      setCurrentPage(1)
    },
    [setCurrentPage, setSearch],
  )

  const handleSiteFilterChange = useCallback(
    (value) => {
      setFilterSite(value)
      setCurrentPage(1)
    },
    [setCurrentPage, setFilterSite],
  )

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

      <Row gutter={[16, 16]}>
        {paginatedData.map((item) => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <FuelCard item={item} />
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
        />
      </div>
    </div>
  )
}

export default FuelStock
