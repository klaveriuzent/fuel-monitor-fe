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
import { tankColumns } from './interface'

const MasterTanks = () => {
  const [visible, setVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dummy data
  const dataSource = [
    {
      key: '1',
      id: 'T001',
      idTank: 'Tank_A1',
      site: 'Jakarta',
      type: 'CPO',
      grade: 'Premium',
      active: true,
    },
    {
      key: '2',
      id: 'T002',
      idTank: 'Tank_B7',
      site: 'Bandung',
      type: 'Kernel',
      grade: 'Standard',
      active: false,
    },
    {
      key: '3',
      id: 'T003',
      idTank: 'Tank_C3',
      site: 'Surabaya',
      type: 'CPO',
      grade: 'Export',
      active: true,
    },
  ]

  // Filter
  const filteredData = dataSource.filter((item) => {
    const matchesText =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.idTank.toLowerCase().includes(search.toLowerCase()) ||
      item.site.toLowerCase().includes(search.toLowerCase())
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
      site: record.site,
      type: record.type,
      grade: record.grade,
      active: record.active,
    })
    setVisible(true)
  }

  const columns = tankColumns.map((col) =>
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
          <CCol xs={12} sm={5} md={4}>
            <CFormInput
              type="text"
              placeholder="Search by ID / Tank ID / Site..."
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
          <CModalTitle>
            Edit Tank: {selectedRecord?.idTank} ({selectedRecord?.id})
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Site */}
            <CRow className="mb-3">
              <CFormLabel htmlFor="site" className="col-sm-3 col-form-label">
                Site
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="site"
                  name="site"
                  value={formData.site || ''}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            {/* Type */}
            <CRow className="mb-3">
              <CFormLabel htmlFor="type" className="col-sm-3 col-form-label">
                Type
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type || ''}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            {/* Grade */}
            <CRow className="mb-3">
              <CFormLabel htmlFor="grade" className="col-sm-3 col-form-label">
                Grade
              </CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="text"
                  id="grade"
                  name="grade"
                  value={formData.grade || ''}
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

export default MasterTanks