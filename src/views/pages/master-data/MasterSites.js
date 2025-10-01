/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Row, Col, Pagination, Tag } from 'antd'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
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
  const [currentPage, setCurrentPage] = useState(1)

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const filterGroup = useSelector((state) => state.filterGroup)

  const pageSize = 8

  const fetchSites = useCallback(async () => {
    setLoading(true)
    try {
      let url = `${baseURL}/site`
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

  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

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
      // await axios.put(`${baseURL}/site/${selectedRecord.id}`, formData)
      setVisible(false)
      fetchSites()
    } catch (error) {
      console.error('Error updating site:', error)
    }
  }

  return (
    <div>
      {/* Filter Section */}
      <CCard className="mb-3 p-3">
        <CRow className="align-items-center g-2">
          <CCol xs={12} sm={5} md={4}>
            <CFormInput
              type="text"
              placeholder="Search by ID Site / BACode / Area..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
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
                setCurrentPage(1)
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
                setCurrentPage(1)
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

      {/* Pagination Top */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          responsive
          simple
        />
      </div>

      {/* Cards Section */}
      <Row gutter={[16, 16]}>
        {paginatedData.map((site) => (
          <Col key={site.key} xs={24} sm={12} md={8} lg={6}>
            <CCard className="shadow-sm h-full" style={{ height: '100%' }}>
              <CCardBody
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
              >
                {/* Status */}
                <div style={{ marginBottom: '6px' }}>
                  <Tag
                    color={site.active ? 'green' : 'red'}
                    style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0 6px' }}
                  >
                    {site.active ? 'Active' : 'Offline'}
                  </Tag>
                </div>

                {/* Konten utama */}
                <div>
                  <CCardTitle style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                    {site.idSite} - {site.bacode}
                  </CCardTitle>

                  <CCardText style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    <b>Area:</b> {site.area}
                  </CCardText>
                  <CCardText style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    <b>City:</b> {site.locationCity}
                  </CCardText>
                  <CCardText style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    <b>Address:</b> {site.locationAddress}
                  </CCardText>
                  <CCardText style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    <b>Coordinates:</b> {site.coordinates}
                  </CCardText>

                  <CCardText style={{ fontSize: '0.7rem', color: '#666', marginTop: '8px' }}>
                    <b>Created:</b> {site.userCreate} ({site.dateCreate}) <br />
                    <b>Updated:</b> {site.updateBy} ({site.updateDate})
                  </CCardText>
                </div>

                {/* Tombol konsisten di bawah */}
                <div style={{ marginTop: 'auto', textAlign: 'right' }}>
                  <CButton size="sm" color="primary" onClick={() => handleEdit(site)}>
                    Edit
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </Col>
        ))}

        {loading && (
          <Col xs={24} className="text-center">
            <CSpinner />
          </Col>
        )}
        {!loading && filteredData.length === 0 && (
          <Col xs={24} className="text-center">
            <p>No sites found</p>
          </Col>
        )}
      </Row>

      {/* Pagination Bottom */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          responsive
          simple
        />
      </div>

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

export default MasterSites
