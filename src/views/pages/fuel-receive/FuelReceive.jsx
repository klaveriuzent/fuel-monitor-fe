import React, { useMemo, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import {
  CCard,
  CCardBody,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'
import AppSubHeader from '../../../components/subheader/AppSubHeader'
import AddFuelReceiveModal from '../../../components/modals/AddFuelReceiveModal'
import { getColumnKey } from '../../../utils/table'
import {
  buildFuelReceiveColumns,
  formatDateTime,
  formatDecimal,
  formatPercentage,
  parseDateSafe,
} from './interface.fuelreceive'
import ResponsiveTableCards from '../../../components/ResponsiveTableCards'
import '../tableDarkMode.scss'

dayjs.extend(isBetween)

const baseURL = import.meta.env.VITE_API_BASE_URL

const allFuelReceiveColumnKeys = buildFuelReceiveColumns()
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
  const [modalTitle, setModalTitle] = useState('Add New Fuel Receive')
  const [isSaving, setIsSaving] = useState(false)
  const [siteOptions, setSiteOptions] = useState([])
  const [isLoadingSites, setIsLoadingSites] = useState(false)
  const [tankOptions, setTankOptions] = useState([])
  const [isLoadingTanks, setIsLoadingTanks] = useState(false)
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false)
  const [selectedAttachmentRecord, setSelectedAttachmentRecord] = useState(null)

  const handleEdit = useCallback(
    (record) => {
      const formatDateTimeLocal = (value) => {
        const parsed = parseDateSafe(value)
        if (!parsed) return ''
        return dayjs(parsed).format('YYYY-MM-DDTHH:mm')
      }

      const nextFormData = {
        ...initialFormData,
        no: record?.no ?? '',
        id_tank: record?.id_tank ?? '',
        volume_minyak_awal: record?.volume_minyak_awal ?? '',
        volume_minyak_akhir: record?.volume_minyak_akhir ?? '',
        tinggi_minyak_awal: record?.tinggi_minyak_awal ?? '',
        tinggi_minyak_akhir: record?.tinggi_minyak_akhir ?? '',
        volume_air_awal: record?.volume_air_awal ?? '',
        volume_air_akhir: record?.volume_air_akhir ?? '',
        tinggi_air_awal: record?.tinggi_air_awal ?? '',
        tinggi_air_akhir: record?.tinggi_air_akhir ?? '',
        waktu_mulai_delivery: formatDateTimeLocal(record?.waktu_mulai_delivery),
        waktu_selesai_delivery: formatDateTimeLocal(record?.waktu_selesai_delivery),
        volume_permintaan: record?.volume_permintaan ?? '',
        no_do: record?.no_do ?? '',
        no_invoice: record?.no_invoice ?? '',
        no_kendaraan: record?.no_kendaraan ?? '',
        nama_pengemudi: record?.nama_pengemudi ?? '',
        pengirim: record?.pengirim ?? '',
        id_site: record?.id_site ?? '',
      }

      setFormData(nextFormData)
      setModalTitle('Edit Item Fuel Receive')
      setIsModalOpen(true)
    },
    [setFormData],
  )

  const handleOpenAttachmentModal = useCallback((record) => {
    setSelectedAttachmentRecord(record || null)
    setIsAttachmentModalOpen(true)
  }, [])

  const handleCloseAttachmentModal = useCallback(() => {
    setIsAttachmentModalOpen(false)
    setSelectedAttachmentRecord(null)
  }, [])

  const allColumns = useMemo(
    () => buildFuelReceiveColumns(handleEdit, handleOpenAttachmentModal),
    [handleEdit, handleOpenAttachmentModal],
  )

  const tableColumns = useMemo(
    () => allColumns.filter((column) => visibleColumnKeys.includes(getColumnKey(column))),
    [allColumns, visibleColumnKeys],
  )

  const renderFuelReceiveCard = (record) => {
    const activeColumns = allColumns.filter((column) => visibleColumnKeys.includes(getColumnKey(column)))

    const getCardValue = (columnKey) => {
      if (columnKey === 'id_site') return record.id_site || '-'
      if (columnKey === 'id_tank') return record.id_tank || '-'
      if (columnKey === 'waktu_mulai_delivery') return formatDateTime(record.waktu_mulai_delivery)

      if (columnKey === 'document') {
        return `PO: ${record.no_invoice || '-'} | DO: ${record.no_do || '-'} | Vol: ${formatDecimal(record.volume_permintaan || 0)}`
      }

      if (columnKey === 'pengiriman') {
        return `${record.pengirim || '-'} | Plate: ${record.no_kendaraan || '-'} | Driver: ${record.nama_pengemudi || '-'}`
      }

      if (columnKey === 'total_information') {
        return `Delivery: ${formatDecimal(record.total_deliv || 0)} | Request: ${formatDecimal(record.total_permintaan || 0)} | Selisih: ${formatDecimal(record.total_selisih || 0)} (${formatPercentage(record.persentase_selisih || 0)})`
      }
      if (columnKey === 'attachment') {
        return (
          <CButton
            color="secondary"
            size="sm"
            variant="outline"
            onClick={() => handleOpenAttachmentModal(record)}
          >
            Upload
          </CButton>
        )
      }

      return '-'
    }

    return (
      <CCard className="mb-2">
        <CCardBody className="py-2">
          {activeColumns.map((column) => {
            const key = getColumnKey(column)
            return (
              <div
                key={key}
                className="d-flex justify-content-between align-items-start py-1"
                style={{ borderBottom: '1px dashed var(--cui-border-color-translucent, rgba(0,0,0,.1))' }}
              >
                <div className="small fw-semibold text-secondary">{column.title}</div>
                <div className="small text-end ms-3">{getCardValue(key)}</div>
              </div>
            )
          })}
        </CCardBody>
      </CCard>
    )
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setData([])
      const res = await axios.get(`${baseURL}tankdeliv`)
      if (res.data && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((item) => ({
          key: `${item.id_site}-${item.id_tank}-${item.waktu_mulai_delivery}`,
          no: item.no,
          waktu_mulai_delivery: item.waktu_mulai_delivery,
          waktu_selesai_delivery: item.waktu_selesai_delivery,
          id_site: item.id_site,
          id_tank: item.id_tank,
          volume_minyak_awal: item.volume_minyak_awal,
          volume_minyak_akhir: item.volume_minyak_akhir,
          tinggi_minyak_awal: item.tinggi_minyak_awal,
          tinggi_minyak_akhir: item.tinggi_minyak_akhir,
          volume_air_awal: item.volume_air_awal,
          volume_air_akhir: item.volume_air_akhir,
          tinggi_air_awal: item.tinggi_air_awal,
          tinggi_air_akhir: item.tinggi_air_akhir,
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
    setModalTitle('Add New Fuel Receive')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData(initialFormData)
    setModalTitle('Add New Fuel Receive')
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
  const handleExport = async () => {
    const exportData = filteredData.map((item) => ({
      Site: item.id_site,
      Tank: item.id_tank,
      //Date: formatDateTime(item.waktu_mulai_delivery),
      Date: item.waktu_mulai_delivery,
      'No. PO': item.no_invoice,
      'No. DO': item.no_do,
      'Requested Volume (L)': formatDecimal(item.volume_permintaan),
      'Delivered Volume (L)': formatDecimal(item.total_deliv),
      'Requested Total (L)': formatDecimal(item.total_permintaan),
      'Variance (L)': formatDecimal(item.total_selisih),
      'Variance (%)': formatDecimal(item.persentase_selisih),
      'License Plate': item.no_kendaraan,
      Driver: item.nama_pengemudi,
      Sender: item.pengirim,
    }))

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('FuelReceive')
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
        columns={allColumns}
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

          <ResponsiveTableCards
            dataSource={filteredData}
            loading={loading}
            emptyText="No data"
            mobilePageSize={8}
            rowKey="key"
            renderCard={renderFuelReceiveCard}
            tableProps={{
              columns: tableColumns,
              className: 'app-data-table',
              pagination: {
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
              },
              scroll: { x: 'max-content' },
              bordered: true,
            }}
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
        title={modalTitle}
        siteOptions={siteOptions}
        isLoadingSites={isLoadingSites}
        tankOptions={availableTankOptions}
        isLoadingTanks={isLoadingTanks}
      />

      <CModal visible={isAttachmentModalOpen} onClose={handleCloseAttachmentModal} alignment="center">
        <CModalHeader>
          <CModalTitle>Upload Attachment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="small text-secondary mb-2">
            Ini masih mode dummy. Proses upload file belum diaktifkan.
          </div>
          <div className="small">
            <div>
              <strong>Site:</strong> {selectedAttachmentRecord?.id_site || '-'}
            </div>
            <div>
              <strong>Tank:</strong> {selectedAttachmentRecord?.id_tank || '-'}
            </div>
            <div>
              <strong>Date:</strong> {selectedAttachmentRecord?.waktu_mulai_delivery || '-'}
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseAttachmentModal}>
            Close
          </CButton>
          <CButton color="primary" disabled>
            Upload (Soon)
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default FuelReceive
