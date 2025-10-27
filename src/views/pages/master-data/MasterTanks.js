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
  const [currentPage, setCurrentPage] = useState(1)

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const filterGroup = useSelector((state) => state.filterGroup)

  const pageSize = 8

  const fetchTanks = useCallback(async () => {
    setLoading(true)
    try {
      let url = `${baseURL}/ms-tank`
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
      // await axios.put(`${baseURL}/ms-tank/${selectedRecord.id}`, formData)
      setVisible(false)
      fetchTanks()
    } catch (error) {
      console.error('Error updating tank:', error)
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
              placeholder="Search by Tank ID / ID Site / Type / Grade..."
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
            <CButton color="info" size="sm" onClick={fetchTanks} disabled={loading}>
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
        {paginatedData.map((tank) => (
          <Col key={tank.key} xs={24} sm={12} md={8} lg={6}>
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
                    color={tank.active ? 'green' : 'red'}
                    style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0 6px' }}
                  >
                    {tank.active ? 'Active' : 'Offline'}
                  </Tag>
                </div>

                {/* Konten utama */}
                <div>
                  <CCardTitle style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                    Tank {tank.idTank} - {tank.idSite}
                  </CCardTitle>

                  <CCardText style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    <b>Type:</b> {tank.type}
                  </CCardText>
                  <CCardText style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    <b>Grade:</b> {tank.grade}
                  </CCardText>
                  <CCardText style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    <b>Company:</b> {tank.company}
                  </CCardText>

                  {tank.lastData && (
                    <CCardText style={{ fontSize: '0.75rem', marginTop: '8px', color: '#555' }}>
                      <b>Last Update:</b> {tank.lastData.update_date} <br />
                      <b>Volume Oil:</b> {tank.lastData.volume_oil} L <br />
                      <b>Temperature:</b> {tank.lastData.temperature} °C
                    </CCardText>
                  )}
                </div>

                {/* Tombol konsisten di bawah */}
                <div style={{ marginTop: 'auto', textAlign: 'right' }}>
                  <CButton size="sm" color="primary" onClick={() => handleEdit(tank)}>
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
            <p>No tanks found</p>
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
