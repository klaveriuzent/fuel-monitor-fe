import React, { useMemo, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { Table } from 'antd'
import {
  CCard,
  CCardBody,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CCol,
} from '@coreui/react'
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
import '../tableDarkMode.scss'

dayjs.extend(isBetween)

const baseURL = import.meta.env.VITE_API_BASE_URL

const allFuelReceiveColumnKeys = fuelReceiveColumns
  .map((column) => getColumnKey(column))
  .filter(Boolean)

const initialFormData = {
  no: '',
  id_tank: '',
  id_shift: '',
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
  delivery_flag: '',
  id_site: '',
  id_company: '',
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
  }, [])

  // Fetch data dari API tankdeliv
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      await axios.post(`${baseURL}tankdeliv`, formData)
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
            <CButton
              color="primary"
              size="sm"
              className="text-white"
              onClick={handleOpenModal}
            >
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

      <CModal visible={isModalOpen} onClose={handleCloseModal} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Add New Fuel Receive</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSave}>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="id_site">Site ID</CFormLabel>
                <CFormInput
                  id="id_site"
                  name="id_site"
                  value={formData.id_site}
                  onChange={handleFormChange}
                  placeholder="e.g. SITE-001"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="id_tank">Tank ID</CFormLabel>
                <CFormInput
                  id="id_tank"
                  name="id_tank"
                  value={formData.id_tank}
                  onChange={handleFormChange}
                  placeholder="e.g. TANK-01"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="waktu_mulai_delivery">Delivery Start</CFormLabel>
                <CFormInput
                  type="datetime-local"
                  id="waktu_mulai_delivery"
                  name="waktu_mulai_delivery"
                  value={formData.waktu_mulai_delivery}
                  onChange={handleFormChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="waktu_selesai_delivery">Delivery End</CFormLabel>
                <CFormInput
                  type="datetime-local"
                  id="waktu_selesai_delivery"
                  name="waktu_selesai_delivery"
                  value={formData.waktu_selesai_delivery}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="volume_minyak_awal">Initial Oil Volume (L)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="volume_minyak_awal"
                  name="volume_minyak_awal"
                  value={formData.volume_minyak_awal}
                  onChange={handleFormChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="volume_minyak_akhir">Final Oil Volume (L)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="volume_minyak_akhir"
                  name="volume_minyak_akhir"
                  value={formData.volume_minyak_akhir}
                  onChange={handleFormChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="volume_permintaan">Requested Volume (L)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="volume_permintaan"
                  name="volume_permintaan"
                  value={formData.volume_permintaan}
                  onChange={handleFormChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="id_shift">Shift ID</CFormLabel>
                <CFormInput
                  id="id_shift"
                  name="id_shift"
                  value={formData.id_shift}
                  onChange={handleFormChange}
                  placeholder="Optional"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="no_invoice">Invoice Number</CFormLabel>
                <CFormInput
                  id="no_invoice"
                  name="no_invoice"
                  value={formData.no_invoice}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="no_do">Delivery Order Number</CFormLabel>
                <CFormInput id="no_do" name="no_do" value={formData.no_do} onChange={handleFormChange} />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="no_kendaraan">License Plate</CFormLabel>
                <CFormInput
                  id="no_kendaraan"
                  name="no_kendaraan"
                  value={formData.no_kendaraan}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="nama_pengemudi">Driver Name</CFormLabel>
                <CFormInput
                  id="nama_pengemudi"
                  name="nama_pengemudi"
                  value={formData.nama_pengemudi}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="pengirim">Sender</CFormLabel>
                <CFormInput id="pengirim" name="pengirim" value={formData.pengirim} onChange={handleFormChange} />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="volume_air_awal">Initial Water Volume (L)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="volume_air_awal"
                  name="volume_air_awal"
                  value={formData.volume_air_awal}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="volume_air_akhir">Final Water Volume (L)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="volume_air_akhir"
                  name="volume_air_akhir"
                  value={formData.volume_air_akhir}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="tinggi_minyak_awal">Initial Oil Height (cm)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="tinggi_minyak_awal"
                  name="tinggi_minyak_awal"
                  value={formData.tinggi_minyak_awal}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="tinggi_minyak_akhir">Final Oil Height (cm)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="tinggi_minyak_akhir"
                  name="tinggi_minyak_akhir"
                  value={formData.tinggi_minyak_akhir}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="tinggi_air_awal">Initial Water Height (cm)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="tinggi_air_awal"
                  name="tinggi_air_awal"
                  value={formData.tinggi_air_awal}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="tinggi_air_akhir">Final Water Height (cm)</CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  id="tinggi_air_akhir"
                  name="tinggi_air_akhir"
                  value={formData.tinggi_air_akhir}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="delivery_flag">Delivery Flag</CFormLabel>
                <CFormInput
                  id="delivery_flag"
                  name="delivery_flag"
                  value={formData.delivery_flag}
                  onChange={handleFormChange}
                  placeholder="Optional"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="id_company">Company ID</CFormLabel>
                <CFormInput
                  id="id_company"
                  name="id_company"
                  value={formData.id_company}
                  onChange={handleFormChange}
                  placeholder="Optional"
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal} disabled={isSaving}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSave} disabled={!isFormValid || isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default FuelReceive
