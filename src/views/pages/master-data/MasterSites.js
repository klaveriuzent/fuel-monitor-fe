/* eslint-disable prettier/prettier */
import React from 'react'
import { Table } from 'antd'
import { CCard, CCardBody } from '@coreui/react'
import { siteColumns } from './interface'

const MasterSites = () => {
  // Data dummy
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
    {
      key: '3',
      group: 'LSIP',
      idSite: 'LSIP_LSIP_Budi_Tirta_Estate',
      area: 'Surabaya',
      bacode: 'FTEV',
      coordinates: '112.7508, -7.2575',
      active: true,
    },
  ]

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <Table
            dataSource={dataSource}
            columns={siteColumns}
            pagination={true}
            scroll={{
              x: 'max-content', // scroll horizontal
              // y: 400,           // scroll vertical dengan tinggi 400px
            }}
            bordered
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default MasterSites