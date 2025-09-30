/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { Table, message } from 'antd'
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

const MasterSites = () => {
  const [visible, setVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)

  const baseURL = import.meta.env.VITE_API_BASE_URL

  // Fetch data dari API
  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${baseURL}/site`)

        // Transform data dari API ke format yang dibutuhkan tabel
        const transformedData = response.data.data.map((item) => ({
          key: item.id,
          id: item.id,
          group: item.company_name,
          idSite: item.id_site,
          area: item.location_area,
          bacode: item.id_location, // sesuaikan dengan field yang sesuai
          coordinates:
            item.latitute && item.longitute ? `${item.longitute}, ${item.latitute}` : '-',
          active: item.is_active === '1',
          locationCity: item.location_city,
          locationAddress: item.location_address,
        }))

        setDataSource(transformedData)
        message.success('Data berhasil dimuat')
      } catch (error) {
        console.error('Error fetching sites:', error)
        message.error('Gagal memuat data sites')
      } finally {
        setLoading(false)
      }
    }

    fetchSites()
  }, [baseURL])

  // Function untuk refresh manual
  const handleRefresh = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${baseURL}/site`)

      const transformedData = response.data.data.map((item) => ({
        key: item.id,
        id: item.id,
        group: item.company_name,
        idSite: item.id_site,
        area: item.location_area,
        bacode: item.id_location,
        coordinates: item.latitute && item.longitute ? `${item.longitute}, ${item.latitute}` : '-',
        active: item.is_active === '1',
        locationCity: item.location_city,
        locationAddress: item.location_address,
      }))

      setDataSource(transformedData)
      message.success('Data berhasil di-refresh')
    } catch (error) {
      console.error('Error fetching sites:', error)
      message.error('Gagal memuat data sites')
    } finally {
      setLoading(false)
    }
  }

  // Filter data
  const filteredData = dataSource.filter((item) => {
    const matchesText =
      item.idSite.toLowerCase().includes(search.toLowerCase()) ||
      item.bacode.toLowerCase().includes(search.toLowerCase()) ||
      item.area.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? item.active : !item.active
    return matchesText && matchesStatus
  })

  const handleEdit = (record) => {
    setSelectedRecord(record)
    setFormData({
      bacode: record.bacode,
      area: record.area,
      coordinates: record.coordinates,
      active: record.active,
      locationCity: record.locationCity,
      locationAddress: record.locationAddress,
    })
    setVisible(true)
  }

  const columns = siteColumns.map((col) =>
    col.key === 'action'
      ? {
          ...col,
          render: (_, record) => (
            <CButton color="primary" size="sm" onClick={() => handleEdit(record)}>
              Edit
            </CButton>
          ),
        }
      : col,
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      // TODO: Implementasi API update
      // await axios.put(`${baseURL}/site/${selectedRecord.id}`, formData)

      message.success('Data berhasil diupdate')
      setVisible(false)
      handleRefresh() // Refresh data
    } catch (error) {
      console.error('Error updating site:', error)
      message.error('Gagal mengupdate data')
    }
  }

  return (
    <>
      {/* Filter Section */}
      <CCard className="mb-3 p-3">
        <CRow className="align-items-center g-2">
          {/* Search */}
          <CCol xs={12} sm={5} md={4}>
            <CFormInput
              type="text"
              placeholder="Search by ID Site / BACode / Area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
            />
          </CCol>

          {/* Status Filter */}
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

          {/* Clear Button */}
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

          {/* Refresh Button */}
          <CCol xs="auto">
            <CButton color="info" size="sm" onClick={handleRefresh} disabled={loading}>
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
            {/* BACode */}
            <CRow className="mb-3">
              <CFormLabel htmlFor="bacode" className="col-sm-3 col-form-label">
                BACode
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="bacode"
                  name="bacode"
                  value={formData.bacode || ''}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            {/* Area */}
            <CRow className="mb-3">
              <CFormLabel htmlFor="area" className="col-sm-3 col-form-label">
                Area
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area || ''}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            {/* Location City */}
            <CRow className="mb-3">
              <CFormLabel htmlFor="locationCity" className="col-sm-3 col-form-label">
                City
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="locationCity"
                  name="locationCity"
                  value={formData.locationCity || ''}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            {/* Coordinates */}
            <CRow className="mb-3">
              <CFormLabel htmlFor="coordinates" className="col-sm-3 col-form-label">
                Coordinates
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="coordinates"
                  name="coordinates"
                  value={formData.coordinates || ''}
                  onChange={handleChange}
                  placeholder="longitude, latitude"
                />
              </CCol>
            </CRow>

            {/* Status */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Status</CFormLabel>
              <CCol sm={9}>
                <CFormCheck
                  type="radio"
                  name="active"
                  id="statusActive"
                  value="true"
                  label="Active"
                  checked={formData.active === true || formData.active === 'true'}
                  onChange={() => setFormData((prev) => ({ ...prev, active: true }))}
                />
                <CFormCheck
                  type="radio"
                  name="active"
                  id="statusOffline"
                  value="false"
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
