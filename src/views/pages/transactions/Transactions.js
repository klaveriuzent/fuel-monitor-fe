import React, { useMemo, useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { Table } from 'antd'
import { CCard, CCardBody, CButton } from '@coreui/react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import {
  transactionColumns,
  formatCurrency,
  formatDateTime,
  formatDecimal,
} from './interface.transactions'
import AppSubHeader from '../../../components/subheader/AppSubHeader'
import { getColumnKey } from '../../../utils/table'

const baseURL = import.meta.env.VITE_API_BASE_URL

const allTransactionColumnKeys = transactionColumns
  .map((column) => getColumnKey(column))
  .filter(Boolean)

const Transactions = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allTransactionColumnKeys)

  const tableColumns = useMemo(
    () => transactionColumns.filter((column) => visibleColumnKeys.includes(getColumnKey(column))),
    [visibleColumnKeys],
  )

  // Ambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setData([])
        const params = siteFilter !== 'all' ? { id_site: siteFilter } : undefined
        const res = await axios.get(`${baseURL}transaksi`, { params })
        if (res.data && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((item, idx) => ({
            key: `${item.id_site}-${item.id_tank}-${item.waktu_mulai ? item.waktu_mulai : idx}`,
            id_card: item.id_card,
            odometer: Number(item.odometer),
            id_site: item.id_site,
            plat: item.plat,
            username: item.username,
            waktu: item.waktu,
            volume: parseFloat(item.volume),
            unit_price: parseFloat(item.unit_price),
          }))
          setData(formatted)
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [siteFilter])

  // Filter pencarian
  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        const matchesText = [
          item.id_site,
          item.id_card,
          item.plat,
          item.username,
          item.odometer,
          item.volume,
          item.unit_price,
        ].some(
          (field) =>
            field !== undefined &&
            field !== null &&
            field.toString().toLowerCase().includes(search.toLowerCase()),
        )

        const matchesSite =
          siteFilter === 'all' ? true : item.id_site.toLowerCase() === siteFilter.toLowerCase()

        const matchesDate =
          dateRange && dateRange[0] && dateRange[1]
            ? (() => {
                const [start, end] = dateRange
                const itemDate = new Date(item.waktu)
                const startDate = start.startOf('day').toDate()
                const endDate = end.endOf('day').toDate()
                return itemDate >= startDate && itemDate <= endDate
              })()
            : true

        return matchesText && matchesSite && matchesDate
      }),
    [dateRange, search, siteFilter, data],
  )

  // Export Excel (tetap sama)
  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      Site: item.id_site,
      Date: formatDateTime(item.waktu),
      'ID Card': item.id_card,
      Username: item.username,
      'License Plate': item.plat || '-',
      Odometer: Number(item.odometer).toLocaleString('id-ID'),
      'Volume (L)': formatDecimal(item.volume),
      'Unit Price (IDR)': formatCurrency(item.unit_price),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    const [startDate, endDate] = dateRange || []
    const formattedStart = startDate ? dayjs(startDate).format('YYYYMMDD') : 'all'
    let formattedEnd = endDate ? dayjs(endDate).format('YYYYMMDD') : 'all'

    if (formattedEnd === 'all' && formattedStart !== 'all') {
      formattedEnd = formattedStart
    }

    const fileName = `transactions-${formattedStart}-${formattedEnd}.xlsx`
    saveAs(blob, fileName)
  }

  return (
    <>
      <AppSubHeader
        search={search}
        setSearch={setSearch}
        siteFilter={siteFilter}
        setSiteFilter={setSiteFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        columns={transactionColumns}
        visibleColumnKeys={visibleColumnKeys}
        setVisibleColumnKeys={setVisibleColumnKeys}
        storageKey="appSubHeaderFilters:transactions"
      />

      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
            <CButton
              color="success"
              size="sm"
              className="text-white"
              onClick={handleExport}
              disabled={!filteredData.length}
            >
              Export to Excel
            </CButton>
          </div>

          <Table
            dataSource={filteredData}
            columns={tableColumns}
            loading={loading}
            pagination
            scroll={{ x: 'max-content' }}
            bordered
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default Transactions
