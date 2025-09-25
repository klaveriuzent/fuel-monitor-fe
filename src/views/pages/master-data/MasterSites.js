/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
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
} from '@coreui/react'
import { siteColumns } from './interface'

const MasterSites = () => {
  const [visible, setVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const dataSource = [
    {
      key: '1',
      group: 'LSIP',
      idSite: 'LSIP_LSIP_Pulo_Rambong_Estate',
      area: 'Jakarta',
      bacode: 'ABCD',
      coordinates: '106.8272, -6.1751',
      active: true,
    },
    {
      key: '2',
      group: 'LSIP',
      idSite: 'LSIP_LSIP_Rambong_Sialang_Estate',
      area: 'Bandung',
      bacode: 'QWER',
      coordinates: '107.6098, -6.9147',
      active: false,
    },
  ]

  // filter data
  const filteredData = dataSource.filter((item) => {
    const matchesText =
      item.idSite.toLowerCase().includes(search.toLowerCase()) ||
      item.bacode.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? item.active
        : !item.active
    return matchesText && matchesStatus
  })

  const handleEdit = (record) => {
    setSelectedRecord(record)
    setFormData({
      bacode: record.bacode,
      area: record.area,
      coordinates: record.coordinates,
      active: record.active,
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
      : col
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
              placeholder="Search by ID Site / BACode..."
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
        </CRow>
      </CCard>

      {/* Table Section */}
      <CCard className="mb-4">
        <CCardBody>
          <Table
            dataSource={filteredData}
            columns={columns}
            pagination={true}
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
          <CButton color="primary">Save changes</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default MasterSites