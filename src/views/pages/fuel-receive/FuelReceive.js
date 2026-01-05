import React, { useMemo, useState, useEffect } from 'react'
import axios from 'axios'
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

const baseURL = import.meta.env.VITE_API_BASE_URL

const allFuelReceiveColumnKeys = fuelReceiveColumns
  .map((column) => getColumnKey(column))
  .filter(Boolean)

const FuelReceive = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState([null, null])
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allFuelReceiveColumnKeys)

  const tableColumns = useMemo(
    () => fuelReceiveColumns.filter((column) => visibleColumnKeys.includes(getColumnKey(column))),
    [visibleColumnKeys],
  )

  // Fetch data dari API tankdeliv
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setData([])
        const params = siteFilter !== 'all' ? { id_site: siteFilter } : undefined
        const res = await axios.get(`${baseURL}tankdeliv`, { params })
        if (res.data && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((item) => ({
            key: `${item.id_site}-${item.id_tank}-${item.waktu_mulai_delivery}`,
            waktu_mulai_delivery: item.waktu_mulai_delivery,
            id_site: item.id_site,
            id_tank: item.id_tank,
            volume_permintaan: parseFloat(item.volume_permintaan || 0),
            no_do: item.no_do,
            no_invoice: item.no_invoice,
            no_kendaraan: item.no_kendaraan,
            nama_pengemudi: item.nama_pengemudi,
            pengirim: item.pengirim,
            total_deliv: parseFloat(item.total_deliv || 0),
            total_permintaan: parseFloat(item.total_permintaan || 0),
            total_selisih: parseFloat(item.total_selisih || 0),
            persentase_selisih: parseFloat(item.persentase_selisih || 0),
          }))

          setData(formatted)
        }
      } catch (err) {
        console.error('Error fetching tank delivery data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [siteFilter])

  // Filter pencarian + tanggal + site
  const filteredData = useMemo(() => {
    return data.filter((item) => {
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
          ? itemDate.isBetween(startDate.startOf('day'), endDate.endOf('day'), null, '[]')
          : itemDate.isSame(startDate, 'day') || itemDate.isAfter(startDate.startOf('day'))
        : true

      return matchesSearch && matchesSite && matchesDate
    })
  }, [data, dateRange, search, siteFilter])

  // Export Excel
  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      Site: item.id_site,
      Tank: item.id_tank,
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

export default FuelReceive
