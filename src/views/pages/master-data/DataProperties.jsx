import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Tag, Collapse } from 'antd'
import {
  CCard,
  CCardBody,
  CFormInput,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormCheck,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster,
} from '@coreui/react'
import axios from 'axios'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'
import { getColumnKey } from '../../../utils/table'
import ResponsiveTableCards from '../../../components/ResponsiveTableCards'
import './masterData.scss'
import '../tableDarkMode.scss'
import '../../../components/subheader/AppSubHeader.scss'

const DEFAULT_TANK_COUNT = 5
const TANK_COUNT_OPTIONS = [1, 2, 3, 4, 5]
const TANK_NUMBERS = [1, 2, 3, 4, 5]
const REQUIRED_COLUMN_KEYS = ['idSite']
const TANK_INPUT_FIELDS = ['tank1', 'tank2', 'tank3', 'tank4', 'tank5']
const DATA_PROPERTIES_COLUMN_OPTIONS = [
  { key: 'idSite', label: 'ID Site' },
  { key: 'bacode', label: 'BACode' },
  { key: 'area', label: 'Area' },
  { key: 'tank1', label: 'Tank 1' },
  { key: 'tank2', label: 'Tank 2' },
  { key: 'tank3', label: 'Tank 3' },
  { key: 'tank4', label: 'Tank 4' },
  { key: 'tank5', label: 'Tank 5' },
  { key: 'siteCapacity', label: 'Site Capacity (L)' },
  { key: 'action', label: 'Action' },
]
const { CheckableTag } = Tag

const mapSiteData = (item) => ({
  key: item.id,
  id: item.id,
  idSite: item.id_site,
  bacode: item.id_location,
  area: item.location_area,
  group: item.company_name,
  coordinates: item.latitute && item.longitute ? `${item.longitute}, ${item.latitute}` : '-',
  active: item.is_active === '1',
  locationCity: item.location_city,
  locationAddress: item.location_address,
  userCreate: item.user_create,
  dateCreate: item.date_create,
  updateBy: item.update_by,
  updateDate: item.update_date,
})

const DataProperties = () => {
  const [visible, setVisible] = useState(false)
  const [addVisible, setAddVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [addFormData, setAddFormData] = useState({})
  const [search, setSearch] = useState('')
  const [tankCountFilter, setTankCountFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(
    DATA_PROPERTIES_COLUMN_OPTIONS.map((column) => column.key),
  )
  const [dataSource, setDataSource] = useState([])
  const [areaOptions, setAreaOptions] = useState([])
  const [tankCountLookup, setTankCountLookup] = useState({ bySite: {}, byBacode: {} })
  const [tankCapacityLookup, setTankCapacityLookup] = useState({ bySite: {}, byBacode: {} })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [toast, addToast] = useState(0)

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const filterGroup = useSelector((state) => state.filterGroup)

  const fetchSites = useCallback(async () => {
    setLoading(true)
    try {
      let url = `${baseURL}site`
      if (filterGroup && filterGroup !== 'all') {
        url += `?id_location=${filterGroup}`
      }
      const { data } = await axios.get(url)
      const transformedData = data.data.map(mapSiteData)
      setDataSource(transformedData)
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoading(false)
    }
  }, [baseURL, filterGroup])

  const fetchLocationAreas = useCallback(async () => {
    try {
      const { data } = await axios.get(`${baseURL}location`)
      const areas = (data?.data || [])
        .map((item) => item.location_area)
        .filter((area) => typeof area === 'string' && area.trim() !== '')
      const uniqueAreas = [...new Set(areas)]
      setAreaOptions(uniqueAreas)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }, [baseURL])

  const fetchTankMeta = useCallback(async () => {
    try {
      const { data } = await axios.get(`${baseURL}ms-tank`)
      const rows = Array.isArray(data?.data) ? data.data : []

      const nextCapacityLookup = { bySite: {}, byBacode: {} }
      const nextCountLookup = { bySite: {}, byBacode: {} }

      const upsertCapacity = (siteKey, bacodeKey, tankNumber, capacityValue) => {
        if (!Number.isInteger(tankNumber) || tankNumber < 1 || tankNumber > 5) return

        if (siteKey) {
          if (!nextCapacityLookup.bySite[siteKey]) nextCapacityLookup.bySite[siteKey] = {}
          nextCapacityLookup.bySite[siteKey][tankNumber] = capacityValue
        }

        if (bacodeKey) {
          if (!nextCapacityLookup.byBacode[bacodeKey]) nextCapacityLookup.byBacode[bacodeKey] = {}
          nextCapacityLookup.byBacode[bacodeKey][tankNumber] = capacityValue
        }
      }

      rows.forEach((item) => {
        const fallbackSiteKey = String(item?.id_site || '')
          .trim()
          .toLowerCase()
        const fallbackBacodeKey = String(item?.id_location || '')
          .trim()
          .toLowerCase()
        const tankRows =
          Array.isArray(item?.last_tank_data) && item.last_tank_data.length
            ? item.last_tank_data
            : [item]

        tankRows.forEach((tankRow) => {
          const siteKey = String(tankRow?.id_site || fallbackSiteKey || '')
            .trim()
            .toLowerCase()
          const bacodeKey = String(tankRow?.id_location || fallbackBacodeKey || '')
            .trim()
            .toLowerCase()
          const tankNumber = Number.parseInt(String(tankRow?.id_tank || ''), 10)
          const rawCapacity = Number(tankRow?.max_capacity ?? item?.max_capacity ?? 0)
          const capacityValue = Number.isFinite(rawCapacity) ? rawCapacity : 0

          upsertCapacity(siteKey, bacodeKey, tankNumber, capacityValue)
        })
      })

      Object.keys(nextCapacityLookup.bySite).forEach((key) => {
        nextCountLookup.bySite[key] = Object.keys(nextCapacityLookup.bySite[key] || {}).length
      })
      Object.keys(nextCapacityLookup.byBacode).forEach((key) => {
        nextCountLookup.byBacode[key] = Object.keys(nextCapacityLookup.byBacode[key] || {}).length
      })

      setTankCountLookup(nextCountLookup)
      setTankCapacityLookup(nextCapacityLookup)
    } catch (error) {
      console.error('Error fetching tank metadata:', error)
    }
  }, [baseURL])

  useEffect(() => {
    fetchSites()
    fetchLocationAreas()
    fetchTankMeta()
  }, [fetchSites, fetchLocationAreas, fetchTankMeta])

  const getTankCount = useCallback(
    (item) => {
      const siteKey = String(item?.idSite || '')
        .trim()
        .toLowerCase()
      const bacodeKey = String(item?.bacode || '')
        .trim()
        .toLowerCase()

      return (
        tankCountLookup.bySite[siteKey] ?? tankCountLookup.byBacode[bacodeKey] ?? DEFAULT_TANK_COUNT
      )
    },
    [tankCountLookup],
  )

  const getTankCapacity = useCallback(
    (item, tankNumber) => {
      const siteKey = String(item?.idSite || '')
        .trim()
        .toLowerCase()
      const bacodeKey = String(item?.bacode || '')
        .trim()
        .toLowerCase()

      return (
        tankCapacityLookup.bySite?.[siteKey]?.[tankNumber] ??
        tankCapacityLookup.byBacode?.[bacodeKey]?.[tankNumber] ??
        null
      )
    },
    [tankCapacityLookup],
  )

  const formatTankCapacity = useCallback((value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return ''
    return Number(value).toLocaleString('id-ID')
  }, [])

  const renderTankTags = useCallback(
    (record, tankNumber) => {
      const capacity = getTankCapacity(record, tankNumber)
      if (capacity === null || capacity === undefined || Number.isNaN(Number(capacity))) {
        return ''
      }

      return (
        <div className="d-flex flex-column gap-1">
          <div>
            <Tag>Capacity</Tag>
            {formatTankCapacity(capacity)}
          </div>
        </div>
      )
    },
    [formatTankCapacity, getTankCapacity],
  )

  const enhancedDataSource = useMemo(
    () =>
      dataSource.map((item) => {
        const capacities = TANK_NUMBERS.map((tankNumber) => getTankCapacity(item, tankNumber))
        const siteCapacity = capacities.reduce(
          (sum, value) => (typeof value === 'number' ? sum + value : sum),
          0,
        )

        return {
          ...item,
          tank1: capacities[0],
          tank2: capacities[1],
          tank3: capacities[2],
          tank4: capacities[3],
          tank5: capacities[4],
          siteCapacity,
        }
      }),
    [dataSource, getTankCapacity],
  )

  const EXPORT_COLUMN_MAP = useMemo(
    () => ({
      idSite: { header: 'ID Site', getValue: (item) => item.idSite || '-' },
      bacode: { header: 'BACode', getValue: (item) => item.bacode || '-' },
      area: { header: 'Area', getValue: (item) => item.area || '-' },
      tank1: { header: 'Tank 1', getValue: (item) => formatTankCapacity(item.tank1) },
      tank2: { header: 'Tank 2', getValue: (item) => formatTankCapacity(item.tank2) },
      tank3: { header: 'Tank 3', getValue: (item) => formatTankCapacity(item.tank3) },
      tank4: { header: 'Tank 4', getValue: (item) => formatTankCapacity(item.tank4) },
      tank5: { header: 'Tank 5', getValue: (item) => formatTankCapacity(item.tank5) },
      siteCapacity: {
        header: 'Site Capacity (L)',
        getValue: (item) => formatTankCapacity(item.siteCapacity),
      },
    }),
    [formatTankCapacity],
  )

  const tankCountOptions = useMemo(() => TANK_COUNT_OPTIONS, [])

  const allColumns = [
    {
      title: 'ID Site',
      dataIndex: 'idSite',
      key: 'idSite',
      width: 120,
      render: (_, record) => (
        <div className="d-flex flex-column align-items-start gap-1">
          <Tag color={record.active ? 'green' : 'default'}>
            {record.active ? 'Active' : 'Offline'}
          </Tag>
          <span>{record.idSite || '-'}</span>
        </div>
      ),
    },
    {
      title: 'BACode',
      dataIndex: 'bacode',
      key: 'bacode',
      width: 80,
      align: 'center',
    },
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tank 1',
      key: 'tank1',
      width: 100,
      align: 'center',
      render: (_, record) => renderTankTags(record, 1),
    },
    {
      title: 'Tank 2',
      key: 'tank2',
      width: 100,
      align: 'center',
      render: (_, record) => renderTankTags(record, 2),
    },
    {
      title: 'Tank 3',
      key: 'tank3',
      width: 100,
      align: 'center',
      render: (_, record) => renderTankTags(record, 3),
    },
    {
      title: 'Tank 4',
      key: 'tank4',
      width: 100,
      align: 'center',
      render: (_, record) => renderTankTags(record, 4),
    },
    {
      title: 'Tank 5',
      key: 'tank5',
      width: 100,
      align: 'center',
      render: (_, record) => renderTankTags(record, 5),
    },
    {
      title: 'Site Capacity (L)',
      key: 'siteCapacity',
      width: 140,
      fixed: 'right',
      align: 'center',
      render: (_, record) => formatTankCapacity(record.siteCapacity),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <CButton size="sm" color="primary" onClick={() => handleEdit(record)}>
          Edit
        </CButton>
      ),
    },
  ]

  const tableColumns = allColumns.filter((column) => {
    const key = getColumnKey(column)
    return visibleColumnKeys.includes(key) || REQUIRED_COLUMN_KEYS.includes(key)
  })
  const mobileCardKeys = useMemo(() => {
    const keys = new Set([...REQUIRED_COLUMN_KEYS, ...visibleColumnKeys])
    return DATA_PROPERTIES_COLUMN_OPTIONS.map((column) => column.key).filter(
      (key) => keys.has(key) && key !== 'action',
    )
  }, [visibleColumnKeys])
  const exportColumnKeys = useMemo(() => {
    const keys = new Set([...REQUIRED_COLUMN_KEYS, ...visibleColumnKeys])
    return [...keys].filter((key) => Boolean(EXPORT_COLUMN_MAP[key]))
  }, [EXPORT_COLUMN_MAP, visibleColumnKeys])

  const filteredData = enhancedDataSource.filter((item) => {
    const query = search.toLowerCase()
    const idSite = String(item.idSite || '').toLowerCase()
    const bacode = String(item.bacode || '').toLowerCase()
    const matchesText = idSite.includes(query) || bacode.includes(query)
    const matchesTankCount =
      tankCountFilter === 'all' ? true : getTankCount(item) === Number(tankCountFilter)
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? item.active : !item.active

    return matchesText && matchesTankCount && matchesStatus
  })
  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase()
    const seen = new Set()

    const suggestions = enhancedDataSource
      .flatMap((item) => [item.idSite, item.bacode])
      .map((value) => String(value || '').trim())
      .filter((value) => value !== '')
      .filter((value) => {
        const key = value.toLowerCase()
        if (query && !key.includes(query)) return false
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 30)

    return suggestions
  }, [enhancedDataSource, search])

  const handleRefresh = () => {
    fetchSites()
    fetchTankMeta()
  }

  const handleColumnToggle = (columnKey) => {
    if (REQUIRED_COLUMN_KEYS.includes(columnKey)) {
      return
    }

    setVisibleColumnKeys((prev = []) => {
      const withRequired = [...new Set([...REQUIRED_COLUMN_KEYS, ...prev])]
      const isActive = withRequired.includes(columnKey)
      const updated = isActive ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
      return DATA_PROPERTIES_COLUMN_OPTIONS.map((column) => column.key).filter((key) =>
        updated.includes(key),
      )
    })
  }

  const handleEdit = (record) => {
    setSelectedRecord(record)
    setFormData({
      ...record,
      tank1: record?.tank1 ?? '0',
      tank2: record?.tank2 ?? '0',
      tank3: record?.tank3 ?? '0',
      tank4: record?.tank4 ?? '0',
      tank5: record?.tank5 ?? '0',
    })
    setVisible(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (TANK_INPUT_FIELDS.includes(name)) {
      const numericOnly = value.replace(/\D/g, '')
      setFormData((prev) => ({ ...prev, [name]: numericOnly || '0' }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    const pushToast = (color, message) => {
      const isSuccess = color === 'success'
      const title = isSuccess ? 'Perubahan Tersimpan' : 'Penyimpanan Gagal'
      const timeLabel = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })

      addToast(
        <CToast autohide delay={4200} color={color} className="text-white border-0 shadow-sm">
          <CToastHeader closeButton className="bg-transparent text-white border-0 pb-1">
            <div className="d-flex align-items-center gap-2 me-auto">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                  opacity: 0.85,
                }}
              />
              <strong>{title}</strong>
            </div>
            <small className="text-white-50">{timeLabel}</small>
          </CToastHeader>
          <CToastBody className="pt-0">{message}</CToastBody>
        </CToast>,
      )
    }

    if (!selectedRecord?.id) {
      pushToast('danger', 'Site tidak valid untuk disimpan.')
      return
    }

    const toBooleanOrNull = (value) => {
      if (value === true || value === 'true') return true
      if (value === false || value === 'false') return false
      return null
    }

    const normalizeTankValue = (value) => String(value ?? '').replace(/\D/g, '')
    const activeValue = toBooleanOrNull(formData.active)
    const payload = {
      active: activeValue,
      area: String(formData.area || '').trim(),
      bacode: String(formData.bacode || '').trim(),
      tank1: normalizeTankValue(formData.tank1),
      tank2: normalizeTankValue(formData.tank2),
      tank3: normalizeTankValue(formData.tank3),
      tank4: normalizeTankValue(formData.tank4),
      tank5: normalizeTankValue(formData.tank5),
      update_by: String(formData.updateBy || '').trim(),
    }

    try {
      setSaving(true)
      await axios.put(`${baseURL}site/${selectedRecord.id}`, payload)
      setVisible(false)
      await Promise.all([fetchSites(), fetchTankMeta()])
      pushToast('success', `Site ${selectedRecord.idSite || ''} berhasil diperbarui.`)
    } catch (error) {
      console.error('Error updating site:', error)
      const apiMessage = error?.response?.data?.message || error?.response?.data?.error
      pushToast('danger', apiMessage || 'Gagal menyimpan perubahan data site.')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenAdd = () => {
    setAddFormData({
      idSite: '',
      bacode: '',
      area: '',
      active: true,
      userCreate: '',
    })
    setAddVisible(true)
  }

  const handleAddChange = (e) => {
    const { name, value } = e.target
    setAddFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateSave = async () => {
    const pushToast = (color, message) => {
      const isSuccess = color === 'success'
      const title = isSuccess ? 'Data Berhasil Ditambahkan' : 'Tambah Data Gagal'
      const timeLabel = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })

      addToast(
        <CToast autohide delay={4200} color={color} className="text-white border-0 shadow-sm">
          <CToastHeader closeButton className="bg-transparent text-white border-0 pb-1">
            <div className="d-flex align-items-center gap-2 me-auto">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                  opacity: 0.85,
                }}
              />
              <strong>{title}</strong>
            </div>
            <small className="text-white-50">{timeLabel}</small>
          </CToastHeader>
          <CToastBody className="pt-0">{message}</CToastBody>
        </CToast>,
      )
    }

    const idSite = String(addFormData.idSite || '').trim()
    if (!idSite) {
      pushToast('danger', 'ID Site wajib diisi.')
      return
    }

    const payload = {
      id_site: idSite,
      bacode: String(addFormData.bacode || '').trim(),
      area: String(addFormData.area || '').trim(),
      active: addFormData.active === true || addFormData.active === 'true',
      user_create: String(addFormData.userCreate || '').trim(),
    }

    try {
      setCreating(true)
      await axios.post(`${baseURL}site`, payload)
      setAddVisible(false)
      await Promise.all([fetchSites(), fetchTankMeta()])
      pushToast('success', `Site ${idSite} berhasil ditambahkan.`)
    } catch (error) {
      console.error('Error creating site:', error)
      const apiMessage = error?.response?.data?.message || error?.response?.data?.error
      pushToast('danger', apiMessage || 'Gagal menambahkan data site.')
    } finally {
      setCreating(false)
    }
  }

  const handleExport = async () => {
    const exportData = filteredData.map((item) => {
      const row = {}
      exportColumnKeys.forEach((key) => {
        const config = EXPORT_COLUMN_MAP[key]
        row[config.header] = config.getValue(item)
      })
      return row
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('DataProperties')
    const headers = exportColumnKeys.map((key) => EXPORT_COLUMN_MAP[key].header)

    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
    }))

    worksheet.addRows(exportData)

    const excelBuffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })

    saveAs(blob, 'data-properties.xlsx')
  }

  const renderDataPropertiesCard = (record) => (
    <CCard className="master-data-card">
      <CCardBody className="master-data-card__body">
        <div className="master-data-mobile-list">
          {mobileCardKeys.map((key) => {
            const label =
              DATA_PROPERTIES_COLUMN_OPTIONS.find((column) => column.key === key)?.label || key

            let valueNode = '-'
            const isIdSite = key === 'idSite'
            if (key === 'idSite') {
              valueNode = (
                <div className="d-flex flex-column align-items-start gap-1">
                  <Tag color={record.active ? 'green' : 'default'}>
                    {record.active ? 'Active' : 'Offline'}
                  </Tag>
                  <div className="master-data-mobile-id-site-row">
                    <span className="master-data-mobile-item__label">ID Site</span>
                    <span className="master-data-mobile-id-site-value">{record.idSite || '-'}</span>
                  </div>
                </div>
              )
            } else if (key === 'bacode') {
              valueNode = record.bacode || '-'
            } else if (key === 'area') {
              valueNode = record.area || '-'
            } else if (['tank1', 'tank2', 'tank3', 'tank4', 'tank5'].includes(key)) {
              valueNode = formatTankCapacity(record[key])
            } else if (key === 'siteCapacity') {
              valueNode = formatTankCapacity(record.siteCapacity)
            }

            return (
              <div
                key={key}
                className={`master-data-mobile-item${isIdSite ? ' master-data-mobile-item--id-site' : ''}`}
              >
                {!isIdSite && <div className="master-data-mobile-item__label">{label}</div>}
                <div className="master-data-mobile-item__value">{valueNode}</div>
              </div>
            )
          })}
        </div>

        {visibleColumnKeys.includes('action') && (
          <div className="master-data-card__actions">
            <CButton size="sm" color="primary" onClick={() => handleEdit(record)}>
              Edit
            </CButton>
          </div>
        )}
      </CCardBody>
    </CCard>
  )

  return (
    <div className="master-data-page">
      {/* Filter Section */}
      <CCard className="master-data-filter-card mb-3">
        <CRow className="align-items-center g-2">
          <CCol xs={12}>
            <div className="d-flex align-items-center gap-2 flex-wrap flex-md-nowrap">
              <div className="flex-grow-1">
                <CFormInput
                  type="text"
                  placeholder="Search by ID Site / BACode..."
                  value={search}
                  list="data-properties-search-options"
                  onChange={(e) => {
                    setSearch(e.target.value)
                  }}
                  size="sm"
                />
                <datalist id="data-properties-search-options">
                  {searchSuggestions.map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </div>

              <CFormSelect
                size="sm"
                value={tankCountFilter}
                onChange={(e) => {
                  setTankCountFilter(e.target.value)
                }}
                style={{ width: '150px' }}
              >
                <option value="all">All Tank Count</option>
                {tankCountOptions.map((count) => (
                  <option key={count} value={count}>
                    {count} Tank
                  </option>
                ))}
              </CFormSelect>

              <CFormSelect
                size="sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                }}
                style={{ width: '130px' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="offline">Offline</option>
              </CFormSelect>

              <CButton
                color="secondary"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setTankCountFilter('all')
                  setStatusFilter('all')
                  setVisibleColumnKeys(DATA_PROPERTIES_COLUMN_OPTIONS.map((column) => column.key))
                }}
              >
                Clear
              </CButton>

              <CButton color="info" size="sm" onClick={handleRefresh} disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Refresh'}
              </CButton>
            </div>
          </CCol>
        </CRow>

        <CRow className="mt-3">
          <Collapse
            ghost
            size="small"
            expandIconPlacement="end"
            items={[
              {
                key: '1',
                label: (
                  <span className="app-subheader__advanced-title text-secondary fw-semibold">
                    Advanced Filter
                  </span>
                ),
                children: (
                  <>
                    <div className="app-subheader__range-label mb-1 text-secondary fw-semibold">
                      Select Column
                    </div>

                    <div className="app-subheader__column-tags">
                      {DATA_PROPERTIES_COLUMN_OPTIONS.map((column) => {
                        const isActive = visibleColumnKeys.includes(column.key)
                        if (REQUIRED_COLUMN_KEYS.includes(column.key)) {
                          return (
                            <Tag key={column.key} className="app-subheader__column-tag is-active">
                              {column.label}
                            </Tag>
                          )
                        }

                        return (
                          <CheckableTag
                            key={column.key}
                            checked={isActive}
                            onChange={() => handleColumnToggle(column.key)}
                            className={`app-subheader__column-tag${isActive ? ' is-active' : ''}`}
                          >
                            {column.label}
                          </CheckableTag>
                        )
                      })}
                    </div>
                  </>
                ),
              },
            ]}
          />
        </CRow>
      </CCard>

      <CCard className="mb-3">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-semibold">Total: {filteredData.length}</span>
            <CButton
              color="success"
              size="sm"
              className="text-white"
              style={{ minWidth: '154.5px' }}
              onClick={handleExport}
              disabled={!filteredData.length || !exportColumnKeys.length}
            >
              Export to Excel
            </CButton>
          </div>
          <div className="d-flex justify-content-end align-items-center mb-3">
            <CButton
              color="primary"
              size="sm"
              style={{ minWidth: '154.5px' }}
              onClick={handleOpenAdd}
            >
              New Data Properties
            </CButton>
          </div>
          <ResponsiveTableCards
            dataSource={filteredData}
            loading={loading}
            emptyText="No sites found"
            mobilePageSize={8}
            rowKey="key"
            renderCard={renderDataPropertiesCard}
            tableProps={{
              className: 'app-data-table',
              bordered: true,
              pagination: {
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
              },
              scroll: { x: 'max-content' },
              locale: { emptyText: 'No sites found' },
              columns: tableColumns,
            }}
          />
        </CCardBody>
      </CCard>

      {/* Modal Edit */}
      <CModal visible={addVisible} onClose={() => setAddVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Add Site</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CFormLabel htmlFor="idSite" className="col-sm-3 col-form-label">
                ID Site
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="idSite"
                  name="idSite"
                  value={addFormData.idSite || ''}
                  onChange={handleAddChange}
                  placeholder="Contoh: SITE001"
                />
                <small className="text-secondary d-block mt-1">
                  Pastikan ID Site sama persis dengan ID mesin yang sudah terdaftar agar integrasi
                  data berjalan benar.
                </small>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Status</CFormLabel>
              <CCol sm={9}>
                <CFormCheck
                  type="radio"
                  name="addActive"
                  id="addStatusActive"
                  label="Active"
                  checked={addFormData.active === true || addFormData.active === 'true'}
                  onChange={() => setAddFormData((prev) => ({ ...prev, active: true }))}
                />
                <CFormCheck
                  type="radio"
                  name="addActive"
                  id="addStatusOffline"
                  label="Offline"
                  checked={addFormData.active === false || addFormData.active === 'false'}
                  onChange={() => setAddFormData((prev) => ({ ...prev, active: false }))}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CFormLabel htmlFor="addArea" className="col-sm-3 col-form-label">
                Area
              </CFormLabel>
              <CCol sm={9}>
                <CFormSelect
                  id="addArea"
                  name="area"
                  value={addFormData.area || ''}
                  onChange={handleAddChange}
                >
                  <option value="">Select Area</option>
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CFormLabel htmlFor="addBacode" className="col-sm-3 col-form-label">
                BACode
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="addBacode"
                  name="bacode"
                  value={addFormData.bacode || ''}
                  onChange={handleAddChange}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleCreateSave} disabled={creating}>
            {creating ? <CSpinner size="sm" /> : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Edit */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Edit Site: {selectedRecord?.idSite}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Status</CFormLabel>
              <CCol sm={9}>
                <CFormCheck
                  type="radio"
                  name="active"
                  id="statusActive"
                  label="Active"
                  checked={formData.active === true || formData.active === 'true'}
                  onChange={() => setFormData((prev) => ({ ...prev, active: true }))}
                />
                <CFormCheck
                  type="radio"
                  name="active"
                  id="statusOffline"
                  label="Offline"
                  checked={formData.active === false || formData.active === 'false'}
                  onChange={() => setFormData((prev) => ({ ...prev, active: false }))}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CFormLabel htmlFor="area" className="col-sm-3 col-form-label">
                Area
              </CFormLabel>
              <CCol sm={9}>
                <CFormSelect
                  id="area"
                  name="area"
                  value={formData.area || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Area</option>
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            {[{ label: 'BACode', name: 'bacode' }].map((field) => (
              <CRow className="mb-3" key={field.name}>
                <CFormLabel htmlFor={field.name} className="col-sm-3 col-form-label">
                  {field.label}
                </CFormLabel>
                <CCol sm={9}>
                  <CFormInput
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    placeholder={field.placeholder || ''}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
            ))}

            {TANK_INPUT_FIELDS.map((tankField, index) => (
              <CRow className="mb-3" key={tankField}>
                <CFormLabel htmlFor={tankField} className="col-sm-3 col-form-label">
                  Tank {index + 1}
                </CFormLabel>
                <CCol sm={9}>
                  <CFormInput
                    type="text"
                    id={tankField}
                    name={tankField}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData[tankField] ?? '0'}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
            ))}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <CSpinner size="sm" /> : 'Save changes'}
          </CButton>
        </CModalFooter>
      </CModal>
      <CToaster push={toast} placement="top-end" className="p-3" />
    </div>
  )
}

export default DataProperties
