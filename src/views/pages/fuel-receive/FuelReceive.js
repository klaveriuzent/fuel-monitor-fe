/* eslint-disable prettier/prettier */
import React, { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { Table } from 'antd'
import { CCard, CCardBody } from '@coreui/react'
import AppSubHeader from '../../../components/subheader/AppSubHeader'
import { fuelReceiveColumns } from './interface.fuelreceive'

dayjs.extend(isBetween)

const FuelReceive = () => {
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState([null, null])

  const dataSource = useMemo(
    () => [
      {
        key: '1',
        waktu_mulai_delivery: '2021-02-02 23:23:23',
        volume_permintaan: '2000',
        no_do: '1234567890',
        no_invoice: '1234567890',
        no_kendaraan: 'A1234S',
        nama_pengemudi: 'Riza',
        pengirim: 'Patra',
        id_site: '1234564',
        total_deliv: '',
        total_permintaan: '',
        total_selisih: '',
        persentase_selisih: '',
      },
      {
        key: '2',
        waktu_mulai_delivery: '2021-02-03 08:15:00',
        volume_permintaan: '1800',
        no_do: '9876543210',
        no_invoice: '9876543210',
        no_kendaraan: 'B5678T',
        nama_pengemudi: 'Dimas',
        pengirim: 'Patra',
        id_site: '1234564',
        total_deliv: '',
        total_permintaan: '',
        total_selisih: '',
        persentase_selisih: '',
      },
      {
        key: '3',
        waktu_mulai_delivery: '2021-02-05 17:45:10',
        volume_permintaan: '2200',
        no_do: '1928374650',
        no_invoice: '1928374650',
        no_kendaraan: 'C9101K',
        nama_pengemudi: 'Riza',
        pengirim: 'Patra',
        id_site: '5678901',
        total_deliv: '',
        total_permintaan: '',
        total_selisih: '',
        persentase_selisih: '',
      },
    ],
    []
  )

  const filteredData = useMemo(() => {
    return dataSource.filter((item) => {
      const searchValue = search.trim().toLowerCase()
      const matchesSearch = searchValue
        ? [
            item.no_do,
            item.no_invoice,
            item.no_kendaraan,
            item.nama_pengemudi,
            item.pengirim,
            item.id_site,
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(searchValue))
        : true

      const matchesSite =
        siteFilter === 'all' ? true : item.id_site === siteFilter

      const [startDate, endDate] = dateRange || []
      const itemDate = dayjs(item.waktu_mulai_delivery)
      const matchesDate = startDate
        ? endDate
          ? itemDate.isBetween(
              startDate.startOf('day'),
              endDate.endOf('day'),
              null,
              '[]'
            )
          :
              itemDate.isSame(startDate, 'day') ||
              itemDate.isAfter(startDate.startOf('day'))
        : true

      return matchesSearch && matchesSite && matchesDate
    })
  }, [dataSource, dateRange, search, siteFilter])

  return (
    <>
      <AppSubHeader
        search={search}
        setSearch={setSearch}
        siteFilter={siteFilter}
        setSiteFilter={setSiteFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* Table Section */}
      <CCard className="mb-4">
        <CCardBody>
          <Table
            dataSource={filteredData}
            columns={fuelReceiveColumns}
            pagination={true}
            scroll={{ x: 'max-content' }}
            bordered
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default FuelReceive
