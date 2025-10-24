/* eslint-disable prettier/prettier */
import React, { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { Table } from 'antd'
import { CCard, CCardBody, CButton } from '@coreui/react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import AppSubHeader from '../../../components/subheader/AppSubHeader'
import { getColumnKey } from '../../../utils/table'
import {
  fuelReceiveColumns,
  formatDateTime,
  formatDecimal,
  formatPercentage,
} from './interface.fuelreceive'

dayjs.extend(isBetween)

const allFuelReceiveColumnKeys = fuelReceiveColumns
  .map((column) => getColumnKey(column))
  .filter(Boolean)

const FuelReceive = () => {
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState([null, null])
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allFuelReceiveColumnKeys)

  const dataSource = useMemo(
    () => [
      {
        key: '1',
        waktu_mulai_delivery: '2025-10-20T23:23:23Z',
        volume_permintaan: 2000,
        no_do: 'DO-20251020-001',
        no_invoice: 'INV-20251020-001',
        no_kendaraan: 'BM 8123 XX',
        nama_pengemudi: 'Riza Saputra',
        pengirim: 'Patra Niaga',
        id_site: 'SIMP_SIMP_Balam_Estate',
        total_deliv: 1985.4,
        total_permintaan: 2000,
        total_selisih: -14.6,
        persentase_selisih: -0.73,
      },
      {
        key: '2',
        waktu_mulai_delivery: '2025-10-21T08:15:00Z',
        volume_permintaan: 1850,
        no_do: 'DO-20251021-003',
        no_invoice: 'INV-20251021-003',
        no_kendaraan: 'BK 5567 ZY',
        nama_pengemudi: 'Dimas Mahendra',
        pengirim: 'Pertamina Patra Niaga',
        id_site: 'SIMP_SIMP_Talang_Estate',
        total_deliv: 1863.8,
        total_permintaan: 1850,
        total_selisih: 13.8,
        persentase_selisih: 0.75,
      },
      {
        key: '3',
        waktu_mulai_delivery: '2025-10-22T17:45:10Z',
        volume_permintaan: 2100.5,
        no_do: 'DO-20251022-007',
        no_invoice: 'INV-20251022-007',
        no_kendaraan: 'BM 9010 QT',
        nama_pengemudi: 'Nia Pratiwi',
        pengirim: 'Elnusa Petrofin',
        id_site: 'SIMP_SIMP_Sawit_Estate',
        total_deliv: 2094.1,
        total_permintaan: 2100.5,
        total_selisih: -6.4,
        persentase_selisih: -0.3,
      },
      {
        key: '4',
        waktu_mulai_delivery: '2025-10-23T03:28:42Z',
        volume_permintaan: 1950.25,
        no_do: 'DO-20251023-009',
        no_invoice: 'INV-20251023-009',
        no_kendaraan: 'BA 4432 PJ',
        nama_pengemudi: 'Tegar Firdaus',
        pengirim: 'Pertamina Lubricants',
        id_site: 'SIMP_SIMP_Kandis_Estate',
        total_deliv: 1958.9,
        total_permintaan: 1950.25,
        total_selisih: 8.65,
        persentase_selisih: 0.44,
      },
    ],
    []
  )

  const tableColumns = useMemo(
    () =>
      fuelReceiveColumns.filter((column) =>
        visibleColumnKeys.includes(getColumnKey(column)),
      ),
    [visibleColumnKeys],
  )

  const filteredData = useMemo(() => {
    return dataSource.filter((item) => {
      const searchValue = search.trim().toLowerCase()
      const matchesSearch = searchValue
        ? [
            item.no_do,
            item.no_invoice,
            item.no_kendaraan,
            item.nama_pengemudi,
            item.pengirim,
            item.id_site,
            item.volume_permintaan,
            item.total_deliv,
            item.total_permintaan,
            item.total_selisih,
            item.persentase_selisih,
          ]
            .filter((field) => field !== undefined && field !== null)
            .some((field) => String(field).toLowerCase().includes(searchValue))
        : true

      const matchesSite =
        siteFilter === 'all'
          ? true
          : item.id_site && item.id_site.toLowerCase() === siteFilter.toLowerCase()

      const [startDate, endDate] = dateRange || []
      const itemDate = dayjs(item.waktu_mulai_delivery)
      const matchesDate = startDate
        ? endDate
          ? itemDate.isBetween(
              startDate.startOf('day'),
              endDate.endOf('day'),
              null,
              '[]'
            )
          :
              itemDate.isSame(startDate, 'day') ||
              itemDate.isAfter(startDate.startOf('day'))
        : true

      return matchesSearch && matchesSite && matchesDate
    })
  }, [dataSource, dateRange, search, siteFilter])

  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      Site: item.id_site,
      Date: formatDateTime(item.waktu_mulai_delivery),
      'No. Invoice': item.no_invoice,
      'No. DO': item.no_do,
      'Requested Volume (L)': formatDecimal(item.volume_permintaan),
      'Delivered Volume (L)': formatDecimal(item.total_deliv),
      'Requested Total (L)': formatDecimal(item.total_permintaan),
      'Variance (L)': formatDecimal(item.total_selisih),
      'Variance (%)': formatPercentage(item.persentase_selisih),
      'License Plate': item.no_kendaraan,
      Driver: item.nama_pengemudi,
      Sender: item.pengirim,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FuelReceive')
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

    const fileName = `fuel-receive-${formattedStart}-${formattedEnd}.xlsx`
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
        columns={fuelReceiveColumns}
        visibleColumnKeys={visibleColumnKeys}
        setVisibleColumnKeys={setVisibleColumnKeys}
        storageKey="appSubHeaderFilters:fuelReceive"
      />

      {/* Table Section */}
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
            pagination={true}
            scroll={{ x: 'max-content' }}
            bordered
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default FuelReceive
