import React, { useMemo, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { Table } from 'antd'
import { CCard, CCardBody, CButton } from '@coreui/react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import AppSubHeader from '../../../components/subheader/AppSubHeader'
import AddFuelReceiveModal from '../../../components/modals/AddFuelReceiveModal'
import { getColumnKey } from '../../../utils/table'
import {
  fuelReceiveColumns,
  formatDateTime,
  formatDecimal,
  formatPercentage,
} from './interface.fuelreceive'
import '../tableDarkMode.scss'

dayjs.extend(isBetween)

const baseURL = import.meta.env.VITE_API_BASE_URL

const allFuelReceiveColumnKeys = fuelReceiveColumns
  .map((column) => getColumnKey(column))
  .filter(Boolean)

const initialFormData = {
  no: '',
  id_tank: '',
  volume_minyak_awal: '',
  volume_minyak_akhir: '',
  tinggi_minyak_awal: '',
  tinggi_minyak_akhir: '',
  volume_air_awal: '',
  volume_air_akhir: '',
  tinggi_air_awal: '',
  tinggi_air_akhir: '',
  waktu_mulai_delivery: '',
  waktu_selesai_delivery: '',
  volume_permintaan: '',
  no_do: '',
  no_invoice: '',
  no_kendaraan: '',
  nama_pengemudi: '',
  pengirim: '',
  id_site: '',
}

const FuelReceive = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState([null, null])
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allFuelReceiveColumnKeys)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [siteOptions, setSiteOptions] = useState([])
  const [isLoadingSites, setIsLoadingSites] = useState(false)
  const [tankOptions, setTankOptions] = useState([])
  const [isLoadingTanks, setIsLoadingTanks] = useState(false)

  const tableColumns = useMemo(
    () => fuelReceiveColumns.filter((column) => visibleColumnKeys.includes(getColumnKey(column))),
    [visibleColumnKeys],
  )

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setData([])
      const res = await axios.get(`${baseURL}tankdeliv`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseURL])

  const fetchSites = useCallback(async () => {
    setIsLoadingSites(true)
    try {
      const { data } = await axios.get(`${baseURL}site`)
      const sites = Array.isArray(data?.data)
        ? data.data.map((item) => item.id_site).filter(Boolean)
        : []
      setSiteOptions([...new Set(sites)])
    } catch (err) {
      console.error('Error fetching site data:', err)
    } finally {
      setIsLoadingSites(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseURL])

  const fetchTanks = useCallback(async () => {
    setIsLoadingTanks(true)
    try {
      const { data } = await axios.get(`${baseURL}ms-tank`)
      const tanks = Array.isArray(data?.data)
        ? data.data
            .map((item) => ({
              idTank: item.id_tank,
              idSite: item.id_site,
            }))
            .filter((item) => item.idTank && item.idSite)
        : []
      setTankOptions(tanks)
    } catch (err) {
      console.error('Error fetching tank data:', err)
    } finally {
      setIsLoadingTanks(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseURL])

  // Fetch data dari API tankdeliv
  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  useEffect(() => {
    fetchTanks()
  }, [fetchTanks])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const nextState = { ...prev, [name]: value }
      if (name === 'id_site') {
        nextState.id_tank = ''
      }
      return nextState
    })
  }

  const handleOpenModal = () => {
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData(initialFormData)
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    if (isSaving) return

    const requiredFields = [
      'id_site',
      'id_tank',
      'waktu_mulai_delivery',
      'volume_minyak_awal',
      'volume_minyak_akhir',
      'volume_permintaan',
    ]

    const isValid = requiredFields.every((field) => String(formData[field] || '').trim())
    if (!isValid) return

    try {
      setIsSaving(true)
      await axios.post(`${baseURL}web/tankdeliv`, formData)
      handleCloseModal()
      fetchData()
    } catch (err) {
      console.error('Error saving tank delivery data:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = useMemo(() => {
    const requiredFields = [
      'id_site',
      'id_tank',
      'waktu_mulai_delivery',
      'volume_minyak_awal',
      'volume_minyak_akhir',
      'volume_permintaan',
    ]

    return requiredFields.every((field) => String(formData[field] || '').trim())
  }, [formData])

  const availableTankOptions = useMemo(() => {
    if (!formData.id_site) return []
    const tanksForSite = tankOptions
      .filter((tank) => tank.idSite === formData.id_site)
      .map((tank) => tank.idTank)
    return [...new Set(tanksForSite)]
  }, [formData.id_site, tankOptions])

  const searchValue = useMemo(() => search.trim().toLowerCase(), [search])

  // Filter pencarian + tanggal (tanpa site filter)
  const filteredBySearchDate = useMemo(() => {
    return data.filter((item) => {
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

      const [startDate, endDate] = dateRange || []
      const itemDate = dayjs(item.waktu_mulai_delivery)
      const matchesDate = startDate
        ? endDate
          ? itemDate.isBetween(startDate.startOf('day'), endDate.endOf('day'), null, '[]')
          : itemDate.isSame(startDate, 'day') || itemDate.isAfter(startDate.startOf('day'))
        : true

      return matchesSearch && matchesDate
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

  // Filter pencarian + tanggal + site
  const filteredData = useMemo(() => {
    if (siteFilter === 'all') return filteredBySearchDate
    return filteredBySearchDate.filter(
      (item) => item.id_site && item.id_site.toLowerCase() === siteFilter.toLowerCase(),
    )
  }, [filteredBySearchDate, siteFilter])

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
        siteCounts={siteCounts}
        siteTotalCount={siteTotalCount}
        dateRange={dateRange}
        setDateRange={setDateRange}
        columns={fuelReceiveColumns}
        visibleColumnKeys={visibleColumnKeys}
        setVisibleColumnKeys={setVisibleColumnKeys}
        storageKey="appSubHeaderFilters:fuelReceive"
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
          <div className="d-flex justify-content-end align-items-center mb-3">
            <CButton color="primary" size="sm" className="text-white" onClick={handleOpenModal}>
              Add New Fuel Receive
            </CButton>
          </div>

          <Table
            dataSource={filteredData}
            columns={tableColumns}
            className="app-data-table"
            loading={loading}
            pagination
            scroll={{ x: 'max-content' }}
            bordered
          />
        </CCardBody>
      </CCard>

      <AddFuelReceiveModal
        visible={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        formData={formData}
        onFormChange={handleFormChange}
        isSaving={isSaving}
        isFormValid={isFormValid}
        siteOptions={siteOptions}
        isLoadingSites={isLoadingSites}
        tankOptions={availableTankOptions}
        isLoadingTanks={isLoadingTanks}
      />
    </>
  )
}

export default FuelReceive
