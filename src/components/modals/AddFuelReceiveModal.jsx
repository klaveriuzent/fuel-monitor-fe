import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CButton,
} from '@coreui/react'
import { Watermark } from 'antd'

const AddFuelReceiveModal = ({
  visible,
  onClose,
  onSave,
  formData,
  onFormChange,
  isSaving,
  isFormValid,
  title = 'Add New Fuel Receive',
  siteOptions,
  isLoadingSites,
  tankOptions,
  isLoadingTanks,
}) => {
  const isTankDisabled = !formData.id_site || isLoadingTanks
  const tankPlaceholder = !formData.id_site
    ? 'Select site first'
    : isLoadingTanks
      ? 'Loading tanks...'
      : 'Select tank'

  return (
    <CModal visible={visible} onClose={onClose} alignment="center" size="lg">
      {title !== 'Add New Fuel Receive' ? (
        <Watermark content="UNDER DEVELOPMENT">
          <CModalHeader>
            <CModalTitle>{title}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={onSave}>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="id_site">Site ID</CFormLabel>
                  <CFormSelect
                    id="id_site"
                    name="id_site"
                    value={formData.id_site}
                    onChange={onFormChange}
                    disabled={isLoadingSites}
                    required
                  >
                    <option value="">{isLoadingSites ? 'Loading sites...' : 'Select site'}</option>
                    {siteOptions.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="id_tank">Tank ID</CFormLabel>
                  <CFormSelect
                    id="id_tank"
                    name="id_tank"
                    value={formData.id_tank}
                    onChange={onFormChange}
                    disabled={isTankDisabled}
                    required
                  >
                    <option value="">{tankPlaceholder}</option>
                    {tankOptions.map((tank) => (
                      <option key={tank} value={tank}>
                        {tank}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="waktu_mulai_delivery">Delivery Start</CFormLabel>
                  <CFormInput
                    type="datetime-local"
                    id="waktu_mulai_delivery"
                    name="waktu_mulai_delivery"
                    value={formData.waktu_mulai_delivery}
                    onChange={onFormChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="waktu_selesai_delivery">Delivery End</CFormLabel>
                  <CFormInput
                    type="datetime-local"
                    id="waktu_selesai_delivery"
                    name="waktu_selesai_delivery"
                    value={formData.waktu_selesai_delivery}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_minyak_awal">Initial Oil Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_minyak_awal"
                    name="volume_minyak_awal"
                    value={formData.volume_minyak_awal}
                    onChange={onFormChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_minyak_akhir">Final Oil Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_minyak_akhir"
                    name="volume_minyak_akhir"
                    value={formData.volume_minyak_akhir}
                    onChange={onFormChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_permintaan">Requested Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_permintaan"
                    name="volume_permintaan"
                    value={formData.volume_permintaan}
                    onChange={onFormChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="no_invoice">Invoice Number</CFormLabel>
                  <CFormInput
                    id="no_invoice"
                    name="no_invoice"
                    value={formData.no_invoice}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="no_do">Delivery Order Number</CFormLabel>
                  <CFormInput
                    id="no_do"
                    name="no_do"
                    value={formData.no_do}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="no_kendaraan">License Plate</CFormLabel>
                  <CFormInput
                    id="no_kendaraan"
                    name="no_kendaraan"
                    value={formData.no_kendaraan}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="nama_pengemudi">Driver Name</CFormLabel>
                  <CFormInput
                    id="nama_pengemudi"
                    name="nama_pengemudi"
                    value={formData.nama_pengemudi}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="pengirim">Sender</CFormLabel>
                  <CFormInput
                    id="pengirim"
                    name="pengirim"
                    value={formData.pengirim}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_air_awal">Initial Water Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_air_awal"
                    name="volume_air_awal"
                    value={formData.volume_air_awal}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_air_akhir">Final Water Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_air_akhir"
                    name="volume_air_akhir"
                    value={formData.volume_air_akhir}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="tinggi_minyak_awal">Initial Oil Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="tinggi_minyak_awal"
                    name="tinggi_minyak_awal"
                    value={formData.tinggi_minyak_awal}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="tinggi_minyak_akhir">Final Oil Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="tinggi_minyak_akhir"
                    name="tinggi_minyak_akhir"
                    value={formData.tinggi_minyak_akhir}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="tinggi_air_awal">Initial Water Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="tinggi_air_awal"
                    name="tinggi_air_awal"
                    value={formData.tinggi_air_awal}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="tinggi_air_akhir">Final Water Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="tinggi_air_akhir"
                    name="tinggi_air_akhir"
                    value={formData.tinggi_air_akhir}
                    onChange={onFormChange}
                  />
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={onSave} disabled={!isFormValid || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </CButton>
          </CModalFooter>
        </Watermark>
      ) : (
        <>
          <CModalHeader>
            <CModalTitle>{title}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={onSave}>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="id_site">Site ID</CFormLabel>
                  <CFormSelect
                    id="id_site"
                    name="id_site"
                    value={formData.id_site}
                    onChange={onFormChange}
                    disabled={isLoadingSites}
                    required
                  >
                    <option value="">{isLoadingSites ? 'Loading sites...' : 'Select site'}</option>
                    {siteOptions.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="id_tank">Tank ID</CFormLabel>
                  <CFormSelect
                    id="id_tank"
                    name="id_tank"
                    value={formData.id_tank}
                    onChange={onFormChange}
                    disabled={isTankDisabled}
                    required
                  >
                    <option value="">{tankPlaceholder}</option>
                    {tankOptions.map((tank) => (
                      <option key={tank} value={tank}>
                        {tank}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="waktu_mulai_delivery">Delivery Start</CFormLabel>
                  <CFormInput
                    type="datetime-local"
                    id="waktu_mulai_delivery"
                    name="waktu_mulai_delivery"
                    value={formData.waktu_mulai_delivery}
                    onChange={onFormChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="waktu_selesai_delivery">Delivery End</CFormLabel>
                  <CFormInput
                    type="datetime-local"
                    id="waktu_selesai_delivery"
                    name="waktu_selesai_delivery"
                    value={formData.waktu_selesai_delivery}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_minyak_awal">Initial Oil Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_minyak_awal"
                    name="volume_minyak_awal"
                    value={formData.volume_minyak_awal}
                    onChange={onFormChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_minyak_akhir">Final Oil Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_minyak_akhir"
                    name="volume_minyak_akhir"
                    value={formData.volume_minyak_akhir}
                    onChange={onFormChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_permintaan">Requested Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_permintaan"
                    name="volume_permintaan"
                    value={formData.volume_permintaan}
                    onChange={onFormChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="no_invoice">Invoice Number</CFormLabel>
                  <CFormInput
                    id="no_invoice"
                    name="no_invoice"
                    value={formData.no_invoice}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="no_do">Delivery Order Number</CFormLabel>
                  <CFormInput
                    id="no_do"
                    name="no_do"
                    value={formData.no_do}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="no_kendaraan">License Plate</CFormLabel>
                  <CFormInput
                    id="no_kendaraan"
                    name="no_kendaraan"
                    value={formData.no_kendaraan}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="nama_pengemudi">Driver Name</CFormLabel>
                  <CFormInput
                    id="nama_pengemudi"
                    name="nama_pengemudi"
                    value={formData.nama_pengemudi}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="pengirim">Sender</CFormLabel>
                  <CFormInput
                    id="pengirim"
                    name="pengirim"
                    value={formData.pengirim}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_air_awal">Initial Water Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_air_awal"
                    name="volume_air_awal"
                    value={formData.volume_air_awal}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="volume_air_akhir">Final Water Volume (L)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="volume_air_akhir"
                    name="volume_air_akhir"
                    value={formData.volume_air_akhir}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="tinggi_minyak_awal">Initial Oil Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="tinggi_minyak_awal"
                    name="tinggi_minyak_awal"
                    value={formData.tinggi_minyak_awal}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="tinggi_minyak_akhir">Final Oil Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="tinggi_minyak_akhir"
                    name="tinggi_minyak_akhir"
                    value={formData.tinggi_minyak_akhir}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="tinggi_air_awal">Initial Water Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="tinggi_air_awal"
                    name="tinggi_air_awal"
                    value={formData.tinggi_air_awal}
                    onChange={onFormChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="tinggi_air_akhir">Final Water Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="any"
                    id="tinggi_air_akhir"
                    name="tinggi_air_akhir"
                    value={formData.tinggi_air_akhir}
                    onChange={onFormChange}
                  />
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={onSave} disabled={!isFormValid || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </CButton>
          </CModalFooter>
        </>
      )}
    </CModal>
  )
}

export default AddFuelReceiveModal
