import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Table, Tag } from 'antd'
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
import './masterData.scss'
import '../tableDarkMode.scss'

const mapTankData = (item) => ({
  key: item.id,
  id: item.id,
  idTank: item.id_tank,
  idSite: item.id_site,
  type: item.type_name,
  grade: item.grade_name,
  company: item.company_name,
  active: item.is_active === 1,
  lastData: item.last_tank_data?.[0] || null,
})

const MasterTanks = () => {
  const [visible, setVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const filterGroup = useSelector((state) => state.filterGroup)

  const fetchTanks = useCallback(async () => {
    setLoading(true)
    try {
      let url = `${baseURL}ms-tank`
      if (filterGroup && filterGroup !== 'all') {
        url += `?id_location=${filterGroup}`
      }
      const { data } = await axios.get(url)
      const transformedData = data.data.map(mapTankData)
      setDataSource(transformedData)
    } catch (error) {
      console.error('Error fetching tanks:', error)
    } finally {
      setLoading(false)
    }
  }, [baseURL, filterGroup])

  useEffect(() => {
    fetchTanks()
  }, [fetchTanks])

  const filteredData = dataSource.filter((item) => {
    const query = search.toLowerCase()
    const matchesText =
      item.idTank?.toString().toLowerCase().includes(query) ||
      item.idSite?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.grade?.toLowerCase().includes(query)
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
      // await axios.put(`${baseURL}ms-tank/${selectedRecord.id}`, formData)
      setVisible(false)
      fetchTanks()
    } catch (error) {
      console.error('Error updating tank:', error)
    }
  }

  return (
    <div className="master-data-page">
      {/* Filter Section */}
      <CCard className="master-data-filter-card mb-3">
        <CRow className="align-items-center g-2">
          <CCol xs={12} sm={5} md={4}>
            <CFormInput
              type="text"
              placeholder="Search by Tank ID / ID Site / Type / Grade..."
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
            <CButton color="info" size="sm" onClick={fetchTanks} disabled={loading}>
              {loading ? <CSpinner size="sm" /> : 'Refresh'}
            </CButton>
          </CCol>
        </CRow>
      </CCard>

      <CCard className="mb-3">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-semibold">Total: {filteredData.length}</span>
          </div>

          <Table
            dataSource={filteredData}
            loading={loading}
            className="app-data-table"
            bordered
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No tanks found' }}
            columns={[
              {
                title: 'Tank ID',
                dataIndex: 'idTank',
                key: 'idTank',
                width: 120,
              },
              {
                title: 'Site ID',
                dataIndex: 'idSite',
                key: 'idSite',
                width: 120,
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                width: 140,
              },
              {
                title: 'Grade',
                dataIndex: 'grade',
                key: 'grade',
                width: 140,
              },
              {
                title: 'Company',
                dataIndex: 'company',
                key: 'company',
                width: 180,
              },
              {
                title: 'Last Update',
                key: 'lastUpdate',
                width: 190,
                render: (_, record) => record.lastData?.update_date || '-',
              },
              {
                title: 'Volume Oil (L)',
                key: 'volumeOil',
                width: 130,
                render: (_, record) => record.lastData?.volume_oil || '-',
              },
              {
                title: 'Temperature (°C)',
                key: 'temperature',
                width: 130,
                render: (_, record) => record.lastData?.temperature || '-',
              },
              {
                title: 'Status',
                key: 'active',
                dataIndex: 'active',
                width: 110,
                render: (active) => {
                  const statusClass = active
                    ? 'master-data-status-tag master-data-status-tag--active'
                    : 'master-data-status-tag master-data-status-tag--offline'

                  return <Tag className={statusClass}>{active ? 'Active' : 'Offline'}</Tag>
                },
              },
              {
                title: 'Action',
                key: 'action',
                width: 90,
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
          <CModalTitle>Edit Tank: {selectedRecord?.idTank}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {[
              { label: 'ID Site', name: 'idSite' },
              { label: 'Type', name: 'type' },
              { label: 'Grade', name: 'grade' },
              { label: 'Company', name: 'company' },
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

export default MasterTanks
