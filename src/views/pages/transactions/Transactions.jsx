import React, { useMemo, useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { CCard, CCardBody, CButton } from '@coreui/react'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'
import {
  transactionColumns,
  formatDateTime,
  formatDecimal,
  formatOptionalDecimal,
} from './interface.transactions'
import '../tableDarkMode.scss'
import AppSubHeader from '../../../components/subheader/AppSubHeader'
import { getColumnKey } from '../../../utils/table'
import ResponsiveTableCards from '../../../components/ResponsiveTableCards'

const baseURL = import.meta.env.VITE_API_BASE_URL

dayjs.extend(isBetween)

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

  const renderTransactionCard = (record) => {
    const activeColumns = transactionColumns.filter((column) =>
      visibleColumnKeys.includes(getColumnKey(column)),
    )

    return (
      <CCard className="mb-2">
        <CCardBody className="py-2">
          {activeColumns.map((column) => {
            const key = getColumnKey(column)
            const rawValue = column.dataIndex ? record?.[column.dataIndex] : undefined
            let value = rawValue

            if (key === 'waktu') value = formatDateTime(rawValue)
            if (key === 'odometer') value = Number(rawValue || 0).toLocaleString('id-ID')
            if (key === 'volume') value = formatDecimal(rawValue || 0)
            if (key === 'unit_price') value = Number(rawValue || 0).toLocaleString('id-ID')
            if (key === 'stock_by_receive') value = '-'
            if (key === 'stock_by_atg') value = formatOptionalDecimal(rawValue)

            return (
              <div
                key={key}
                className="d-flex justify-content-between align-items-start py-1"
                style={{
                  borderBottom: '1px dashed var(--cui-border-color-translucent, rgba(0,0,0,.1))',
                }}
              >
                <div className="small fw-semibold text-secondary">{column.title}</div>
                <div className="small text-end ms-3">{value || '-'}</div>
              </div>
            )
          })}
        </CCardBody>
      </CCard>
    )
  }

  // Ambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setData([])
        const res = await axios.get(`${baseURL}transaksi`)
        if (res.data && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((item, idx) => ({
            key: `${item.id_site}-${item.id_tank}-${item.waktu_mulai ? item.waktu_mulai : idx}`,
            id_card: item.id_card,
            odometer: Number(item.odometer),
            id_site: item.id_site,
            username: item.username,
            waktu: item.waktu,
            volume: parseFloat(item.volume),
            unit_price: parseFloat(item.unit_price),
            stock_by_atg: item.atg_level ?? '-',
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
  }, [])

  const searchValue = useMemo(() => search.trim().toLowerCase(), [search])

  const filteredBySearchDate = useMemo(() => {
    return data.filter((item) => {
      const matchesText = searchValue
        ? [item.id_site, item.id_card, item.username, item.odometer, item.volume, item.unit_price]
            .filter((field) => field !== undefined && field !== null)
            .some((field) => field.toString().toLowerCase().includes(searchValue))
        : true

      const [startDate, endDate] = dateRange || []
      const itemDate = dayjs(item.waktu)
      const matchesDate = startDate
        ? endDate
          ? itemDate.isBetween(startDate.startOf('day'), endDate.endOf('day'), null, '[]')
          : itemDate.isSame(startDate, 'day') || itemDate.isAfter(startDate.startOf('day'))
        : true

      return matchesText && matchesDate
    })
  }, [data, dateRange, searchValue])

  const siteCounts = useMemo(() => {
    return filteredBySearchDate.reduce((acc, item) => {
      if (!item.id_site) return acc
      acc[item.id_site] = (acc[item.id_site] || 0) + 1
      return acc
    }, {})
  }, [filteredBySearchDate])

  const siteTotalCount = filteredBySearchDate.length

  const filteredData = useMemo(() => {
    const baseData =
      siteFilter === 'all'
        ? filteredBySearchDate
        : filteredBySearchDate.filter(
            (item) => item.id_site && item.id_site.toLowerCase() === siteFilter.toLowerCase(),
          )

    return [...baseData].sort((a, b) => {
      const timeA = a?.waktu ? new Date(a.waktu).getTime() : 0
      const timeB = b?.waktu ? new Date(b.waktu).getTime() : 0
      return timeB - timeA
    })
  }, [filteredBySearchDate, siteFilter])

  // Export Excel (tetap sama)
  const handleExport = async () => {
    const exportData = filteredData.map((item) => ({
      Site: item.id_site,
      Date: formatDateTime(item.waktu),
      'No. Unit': item.id_card,
      Username: item.username,
      Odometer: Number(item.odometer).toLocaleString('id-ID'),
      'Volume (L)': formatDecimal(item.volume),
      'Unit Price (IDR)': formatDecimal(item.unit_price),
    }))

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Transactions')
    const headers = Object.keys(exportData[0] || {})

    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
    }))

    worksheet.addRows(exportData)

    const excelBuffer = await workbook.xlsx.writeBuffer()
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
        useSitePolishedSelect
        siteCounts={siteCounts}
        siteTotalCount={siteTotalCount}
        dateRange={dateRange}
        setDateRange={setDateRange}
        columns={transactionColumns}
        visibleColumnKeys={visibleColumnKeys}
        setVisibleColumnKeys={setVisibleColumnKeys}
        storageKey="appSubHeaderFilters:transactions"
      />

      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-semibold">Total: {filteredData.length}</span>
            <CButton
              color="success"
              size="sm"
              className="text-white"
              style={{ minWidth: '154.5px' }}
              onClick={handleExport}
              disabled={!filteredData.length}
            >
              Export to Excel
            </CButton>
          </div>

          <ResponsiveTableCards
            dataSource={filteredData}
            loading={loading}
            emptyText="No data"
            mobilePageSize={8}
            rowKey="key"
            renderCard={renderTransactionCard}
            tableProps={{
              columns: tableColumns,
              className: 'app-data-table',
              pagination: true,
              scroll: { x: 'max-content' },
              bordered: true,
            }}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default Transactions
