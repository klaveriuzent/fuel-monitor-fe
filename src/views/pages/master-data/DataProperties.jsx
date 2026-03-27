import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Table } from 'antd'
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
} from '@coreui/react'
import axios from 'axios'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'
import './masterData.scss'
import '../tableDarkMode.scss'

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
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const filteredData = dataSource.filter((item) => {
    const query = search.toLowerCase()
    const matchesText =
      item.idSite.toLowerCase().includes(query) ||
      item.bacode.toLowerCase().includes(query) ||
      item.area.toLowerCase().includes(query)
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? item.active : !item.active
    return matchesText && matchesStatus
  })

  const handleEdit = (record) => {
    setSelectedRecord(record)
    setFormData(record)
    setVisible(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      // await axios.put(`${baseURL}site/${selectedRecord.id}`, formData)
      setVisible(false)
      fetchSites()
    } catch (error) {
      console.error('Error updating site:', error)
    }
  }

  const handleExport = async () => {
    const exportData = filteredData.map((item) => ({
      'ID Site': item.idSite || '-',
      BACode: item.bacode || '-',
      Area: item.area || '-',
      'Tank 1': '-',
      'Tank 2': '-',
      'Tank 3': '-',
      'Tank 4': '-',
      'Tank 5': '-',
      'Site Capacity': '-',
      Status: item.active ? 'Active' : 'Offline',
    }))

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('DataProperties')
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

    saveAs(blob, 'data-properties.xlsx')
  }

  return (
    <div className="master-data-page">
      {/* Filter Section */}
      <CCard className="master-data-filter-card mb-3">
        <CRow className="align-items-center g-2">
          <CCol xs={12} sm={5} md={4}>
            <CFormInput
              type="text"
              placeholder="Search by ID Site / BACode / Area..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
              size="sm"
            />
          </CCol>

          <CCol xs={12} sm={4} md={3}>
            <CFormSelect
              size="sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="offline">Offline</option>
            </CFormSelect>
          </CCol>

          <CCol xs="auto">
            <CButton
              color="secondary"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
              }}
            >
              Clear
            </CButton>
          </CCol>

          <CCol xs="auto">
            <CButton color="info" size="sm" onClick={fetchSites} disabled={loading}>
              {loading ? <CSpinner size="sm" /> : 'Refresh'}
            </CButton>
          </CCol>
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
              disabled={!filteredData.length}
            >
              Export to Excel
            </CButton>
          </div>
          <Table
            dataSource={filteredData}
            loading={loading}
            className="app-data-table"
            bordered
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No sites found' }}
            columns={[
              {
                title: 'ID Site',
                dataIndex: 'idSite',
                key: 'idSite',
                width: 120,
              },
              {
                title: 'BACode',
                dataIndex: 'bacode',
                key: 'bacode',
                width: 120,
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
                render: () => '-',
              },
              {
                title: 'Tank 2',
                key: 'tank2',
                width: 100,
                align: 'center',
                render: () => '-',
              },
              {
                title: 'Tank 3',
                key: 'tank3',
                width: 100,
                align: 'center',
                render: () => '-',
              },
              {
                title: 'Tank 4',
                key: 'tank4',
                width: 100,
                align: 'center',
                render: () => '-',
              },
              {
                title: 'Tank 5',
                key: 'tank5',
                width: 100,
                align: 'center',
                render: () => '-',
              },
              {
                title: 'Site Capacity (L)',
                key: 'siteCapacity',
                width: 140,
                fixed: 'right',
                align: 'center',
                render: () => '-',
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
            ]}
          />
        </CCardBody>
      </CCard>

      {/* Modal Edit */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Edit Site: {selectedRecord?.idSite}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {[
              { label: 'BACode', name: 'bacode' },
              { label: 'Area', name: 'area' },
              { label: 'City', name: 'locationCity' },
              { label: 'Coordinates', name: 'coordinates', placeholder: 'longitude, latitude' },
            ].map((field) => (
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
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSave}>
            Save changes
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default DataProperties
