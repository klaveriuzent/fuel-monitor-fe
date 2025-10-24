import React, { useMemo, useState } from 'react'
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

const dataSource = [
  {
    key: '1',
    id_card: 'ID-001',
    odometer: 342466,
    id_site: 'SIMP_SIMP_Balam_Estate',
    plat: 'BM 1234 XX',
    username: 'operator-01',
    waktu: '2025-09-30T08:36:48Z',
    volume: 19.0,
    unit_price: 6800,
  },
  {
    key: '2',
    id_card: 'ID-002',
    odometer: 298754,
    id_site: 'SIMP_SIMP_Talang_Estate',
    plat: 'BM 5678 YY',
    username: 'operator-02',
    waktu: '2025-10-02T11:22:15Z',
    volume: 22.5,
    unit_price: 6900,
  },
  {
    key: '3',
    id_card: 'ID-003',
    odometer: 365102,
    id_site: 'SIMP_SIMP_Sawit_Estate',
    plat: '',
    username: 'operator-03',
    waktu: '2025-10-05T06:54:03Z',
    volume: 17.25,
    unit_price: 7000,
  },
]

const getColumnKey = (column) => {
  if (column.key) return column.key
  if (Array.isArray(column.dataIndex)) {
    return column.dataIndex.filter(Boolean).join('.')
  }
  return column.dataIndex
}

const allTransactionColumnKeys = transactionColumns
  .map((column) => getColumnKey(column))
  .filter(Boolean)

const Transactions = () => {
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allTransactionColumnKeys)

  const tableColumns = useMemo(
    () =>
      transactionColumns.filter((column) =>
        visibleColumnKeys.includes(getColumnKey(column)),
      ),
    [visibleColumnKeys],
  )

  // filter data berdasarkan search, site, dan rentang tanggal
  const filteredData = useMemo(
    () =>
      dataSource.filter((item) => {
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
    [dateRange, search, siteFilter],
  )

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
