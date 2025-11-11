import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Pagination } from 'antd'

import AppSubHeaderStock from '../../../components/subheader/AppSubHeader.stock'
import FuelCard from '../../../components/fuelcard/FuelCard'

const baseURL = import.meta.env.VITE_API_BASE_URL

const FuelStock = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('all')
  const pageSize = 8

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      try {
        let url = `${baseURL}/ms-tank`
        if (filterSite && filterSite !== 'all') {
          url += `?id_site=${filterSite}`
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch fuel stock data')
        }

        const apiData = await response.json()
        // console.log('API Response:', apiData)

        // pastikan ambil array di dalam property data jika ada
        const list = Array.isArray(apiData.data) ? apiData.data : apiData

        const mappedData = list.map((item) => {
          const tankData =
            Array.isArray(item.last_tank_data) && item.last_tank_data.length > 0
              ? item.last_tank_data[0]
              : {}

          // if (item.id_site === 'LSIP_LSIP_SEI_LAKITAN_ESTATE') {
          //   console.log(`Last Tank Data [${item.id_site}]:`, tankData)
          // }

          return {
            id_tank: tankData.id_tank ?? '',
            id_site: tankData.id_site ?? item.id_site ?? '',
            aktif_flag: tankData.aktif_flag ?? '',
            volume_oil: tankData.volume_oil ?? '',
            volume_air: tankData.volume_air ?? '',
            max_capacity: tankData.max_capacity ?? '',
            ruang_kosong: tankData.ruang_kosong ?? '',
            temperature: tankData.temperature ?? '',
            update_date: tankData.update_date ?? '',
          }
        })

        if (isMounted) {
          setData(mappedData)
        }
      } catch (error) {
        console.error(error)
        if (isMounted) {
          setData([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [filterSite])

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
        {loading ? (
          <Col span={24}>
            <div style={{ textAlign: 'center', width: '100%' }}>Loading...</div>
          </Col>
        ) : (
          paginatedData.map((item) => (
            <Col key={`${item.id_site}-${item.id_tank}`} xs={24} sm={12} md={8} lg={6}>
              <FuelCard item={item} />
            </Col>
          ))
        )}
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
