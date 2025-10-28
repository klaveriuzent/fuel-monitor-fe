import React, { useCallback, useMemo, useState } from 'react'
import { Row, Col, Pagination } from 'antd'

import AppSubHeaderStock from '../../../components/subheader/AppSubHeader.stock'
import FuelCard from '../../../components/fuelcard/FuelCard'

// Static data source
const dataSource = [
  {
    id_tank: 'Tank 001',
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
    id_site: 'Site E',
    aktif_flag: 'Online',
    volume_oil: 6900,
    volume_air: 80,
    max_capacity: 8000,
    tankHeight: 300,
    temperature: '30.2',
    update_date: '2025-09-30 07:20',
  },
  // dst... (hapus juga field type di seluruh objek lain)
]

const FuelStock = () => {
  const data = useMemo(() => dataSource, [])
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('all')
  const pageSize = 8

  const handleSearchChange = useCallback((value) => {
    setSearch(value)
    setCurrentPage(1)
  }, [])

  const handleSiteFilterChange = useCallback((value) => {
    setFilterSite(value)
    setCurrentPage(1)
  }, [])

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
