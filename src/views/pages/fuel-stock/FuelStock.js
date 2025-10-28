import React, { useCallback, useMemo, useState } from 'react'
import { Row, Col, Pagination } from 'antd'

import AppSubHeaderStock from '../../../components/subheader/AppSubHeader.stock'
import FuelCard from '../../../components/fuelcard/FuelCard'

// Static data source
const dataSource = [
  {
    id_tank: 'Tank 001',
    type: 'Shell V-Power',
    id_site: 'Site A',
    aktif_flag: 'Online',
    volume_oil: 5200,
    volume_air: 120,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '27.5',
    update_date: '2025-09-30 08:15',
  },
  {
    id_tank: 'Tank 002',
    type: 'Shell V-Power Nitro+',
    id_site: 'Site B',
    aktif_flag: 'Online',
    volume_oil: 6100,
    volume_air: 90,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '29.1',
    update_date: '2025-09-30 09:05',
  },
  {
    id_tank: 'Tank 003',
    type: 'Shell Diesel',
    id_site: 'Site C',
    aktif_flag: 'Online',
    volume_oil: 4700,
    volume_air: 150,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '26.4',
    update_date: '2025-09-29 16:40',
  },
  {
    id_tank: 'Tank 004',
    type: 'Shell V-Power',
    id_site: 'Site D',
    aktif_flag: 'Offline',
    volume_oil: 3100,
    volume_air: 200,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '24.8',
    update_date: '2025-09-28 11:55',
  },
  {
    id_tank: 'Tank 005',
    type: 'Shell V-Power Nitro+',
    id_site: 'Site E',
    aktif_flag: 'Online',
    volume_oil: 6900,
    volume_air: 80,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '30.2',
    update_date: '2025-09-30 07:20',
  },
  {
    id_tank: 'Tank 006',
    type: 'Shell Diesel',
    id_site: 'Site A',
    aktif_flag: 'Online',
    volume_oil: 5400,
    volume_air: 110,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '28.0',
    update_date: '2025-09-29 18:45',
  },
  {
    id_tank: 'Tank 007',
    type: 'Shell V-Power',
    id_site: 'Site B',
    aktif_flag: 'Online',
    volume_oil: 5800,
    volume_air: 95,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '27.9',
    update_date: '2025-09-27 14:10',
  },
  {
    id_tank: 'Tank 008',
    type: 'Shell V-Power Nitro+',
    id_site: 'Site C',
    aktif_flag: 'Offline',
    volume_oil: 2600,
    volume_air: 180,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '23.7',
    update_date: '2025-09-26 19:35',
  },
  {
    id_tank: 'Tank 009',
    type: 'Shell Diesel',
    id_site: 'Site D',
    aktif_flag: 'Online',
    volume_oil: 6300,
    volume_air: 70,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '29.5',
    update_date: '2025-09-30 05:50',
  },
  {
    id_tank: 'Tank 010',
    type: 'Shell V-Power',
    id_site: 'Site E',
    aktif_flag: 'Online',
    volume_oil: 7100,
    volume_air: 65,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '31.0',
    update_date: '2025-09-29 21:25',
  },
  {
    id_tank: 'Tank 011',
    type: 'Shell V-Power Nitro+',
    id_site: 'Site A',
    aktif_flag: 'Online',
    volume_oil: 5600,
    volume_air: 130,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '28.6',
    update_date: '2025-09-28 08:05',
  },
  {
    id_tank: 'Tank 012',
    type: 'Shell Diesel',
    id_site: 'Site B',
    aktif_flag: 'Online',
    volume_oil: 6000,
    volume_air: 85,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '27.2',
    update_date: '2025-09-27 17:55',
  },
  {
    id_tank: 'Tank 013',
    type: 'Shell V-Power',
    id_site: 'Site C',
    aktif_flag: 'Offline',
    volume_oil: 2900,
    volume_air: 210,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '24.2',
    update_date: '2025-09-25 12:30',
  },
  {
    id_tank: 'Tank 014',
    type: 'Shell V-Power Nitro+',
    id_site: 'Site D',
    aktif_flag: 'Online',
    volume_oil: 6400,
    volume_air: 75,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '29.8',
    update_date: '2025-09-28 15:45',
  },
  {
    id_tank: 'Tank 015',
    type: 'Shell Diesel',
    id_site: 'Site E',
    aktif_flag: 'Online',
    volume_oil: 4800,
    volume_air: 140,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '26.1',
    update_date: '2025-09-26 07:50',
  },
  {
    id_tank: 'Tank 016',
    type: 'Shell V-Power',
    id_site: 'Site A',
    aktif_flag: 'Online',
    volume_oil: 5900,
    volume_air: 100,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '28.8',
    update_date: '2025-09-30 06:40',
  },
  {
    id_tank: 'Tank 017',
    type: 'Shell V-Power Nitro+',
    id_site: 'Site B',
    aktif_flag: 'Online',
    volume_oil: 6200,
    volume_air: 90,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '27.7',
    update_date: '2025-09-29 10:10',
  },
  {
    id_tank: 'Tank 018',
    type: 'Shell Diesel',
    id_site: 'Site C',
    aktif_flag: 'Online',
    volume_oil: 5500,
    volume_air: 115,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '26.9',
    update_date: '2025-09-27 09:35',
  },
  {
    id_tank: 'Tank 019',
    type: 'Shell V-Power',
    id_site: 'Site D',
    aktif_flag: 'Offline',
    volume_oil: 3000,
    volume_air: 190,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '25.4',
    update_date: '2025-09-25 18:20',
  },
  {
    id_tank: 'Tank 020',
    type: 'Shell V-Power Nitro+',
    id_site: 'Site E',
    aktif_flag: 'Online',
    volume_oil: 6700,
    volume_air: 85,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '30.5',
    update_date: '2025-09-29 13:55',
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
    const matchSearch = item.id_tank.toLowerCase().includes(search.toLowerCase())
    const matchSite =
      filterSite === 'all' || item.id_site.toLowerCase().includes(filterSite.toLowerCase())
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
          <Col key={item.id_tank} xs={24} sm={12} md={8} lg={6}>
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
