import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Row, Col, Pagination } from 'antd'
import ExcelJS from 'exceljs'
import axios from 'axios'

import AppSubHeaderStock from '../../../components/subheader/AppSubHeader.stock'
import FuelCard from '../../../components/fuelcard/FuelCard'
import { mapFuelStockData } from './interface.fuelstock'

const baseURL = import.meta.env.VITE_API_BASE_URL

const FuelStock = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('all')

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      setData([])
      try {
        const params = {}
        if (filterSite !== 'all') {
          params.id_site = filterSite
        }

        const { data: apiData } = await axios.get(`${baseURL}ms-tank`, {
          params,
          signal: controller.signal,
        })
        const mappedData = mapFuelStockData(apiData)
        setData(mappedData)
      } catch (error) {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          console.error(error)
          setData([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      controller.abort()
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

  const normalizedSearch = search.trim().toLowerCase()

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const matchSearch =
          normalizedSearch.length === 0 ||
          item.id_tank.toLowerCase().includes(normalizedSearch) ||
          item.id_site.toLowerCase().includes(normalizedSearch)

        const matchSite =
          filterSite === 'all' || item.id_site.toLowerCase() === filterSite.toLowerCase()

        return matchSearch && matchSite
      })
      .sort((a, b) => {
        if (a.id_site !== b.id_site) {
          return a.id_site.localeCompare(b.id_site)
        }
        return a.id_tank.localeCompare(b.id_tank, undefined, { numeric: true })
      })
  }, [data, filterSite, normalizedSearch])

  const handleExport = useCallback(async () => {
    if (!filteredData.length) return

    const exportData = filteredData.map((item) => ({
      'ID Tank': item.id_tank,
      'ID Site': item.id_site,
      'Aktif Flag': item.aktif_flag,
      'Volume Oil': item.volume_oil,
      'Volume Air': item.volume_air,
      'Max Capacity': item.max_capacity,
      'Ruang Kosong': item.ruang_kosong,
      Temperature: item.temperature,
      'Update Date': item.update_date,
    }))

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Fuel Stock')
    const headers = Object.keys(exportData[0])

    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
    }))

    worksheet.addRows(exportData)

    const excelBuffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStamp = new Date().toISOString().slice(0, 10)

    link.href = url
    link.setAttribute('download', `fuel-stock-${dateStamp}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [filteredData])

  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  return (
    <div>
      <AppSubHeaderStock
        search={search}
        setSearch={handleSearchChange}
        siteFilter={filterSite}
        setSiteFilter={handleSiteFilterChange}
        onExport={handleExport}
        isExportDisabled={!filteredData.length}
      />

      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24}>
            <div style={{ textAlign: 'center' }}>Loading...</div>
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
          onChange={setCurrentPage}
          onShowSizeChange={(_, size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          showSizeChanger
          pageSizeOptions={['8', '16', '24', '48']}
          responsive
        />
      </div>
    </div>
  )
}

export default FuelStock
