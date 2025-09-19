/* eslint-disable prettier/prettier */
import React from 'react'
import { Table } from 'antd'
import { CCard, CCardBody } from '@coreui/react'

const MasterTanks = () => {
  // Data dummy
  const dataSource = [
    {
      key: '1',
      name: 'Google',
      url: 'https://www.google.com',
    },
    {
      key: '2',
      name: 'Facebook',
      url: 'https://www.facebook.com',
    },
    {
      key: '3',
      name: 'Twitter',
      url: 'https://www.twitter.com',
    },
  ]

  // Definisi kolom tabel
  const columns = [
    {
      title: 'No',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>,
    },
  ]

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <Table dataSource={dataSource} columns={columns} />
        </CCardBody>
      </CCard>
    </>
  )
}

export default MasterTanks
