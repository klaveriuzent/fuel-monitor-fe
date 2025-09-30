/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react'
import { Table } from 'antd'
import {
  CCard,
  CCardBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
  CFormCheck,
  CFormSelect,
  CSpinner,
} from '@coreui/react'
import { siteColumns } from './interface'
import axios from 'axios'

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

const MasterSites = () => {
  const [visible, setVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)

  const baseURL = import.meta.env.VITE_API_BASE_URL

  const fetchSites = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${baseURL}/site`)
      const transformedData = data.data.map(mapSiteData)
      setDataSource(transformedData)
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoading(false)
    }
  }, [baseURL])

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

  const columns = siteColumns.map((col) => ({
    ...col,
    render: (text, record) =>
      col.render ? col.render(text, { ...record, onEdit: handleEdit }) : text,
  }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      // await axios.put(`${baseURL}/site/${selectedRecord.id}`, formData)
      setVisible(false)
      fetchSites()
    } catch (error) {
      console.error('Error updating site:', error)
    }
  }

  return (
    <>
      {/* Filter Section */}
      <CCard className="mb-3 p-3">
        <CRow className="align-items-center g-2">
          <CCol xs={12} sm={5} md={4}>
            <CFormInput
              type="text"
              placeholder="Search by ID Site / BACode / Area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
            />
          </CCol>

          <CCol xs={12} sm={4} md={3}>
            <CFormSelect
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

      {/* Table Section */}
      <CCard className="mb-4">
        <CCardBody>
          <Table
            dataSource={filteredData}
            columns={columns}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} sites`,
            }}
            scroll={{ x: 'max-content' }}
            bordered
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

            {/* Status */}
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
    </>
  )
}

export default MasterSites
