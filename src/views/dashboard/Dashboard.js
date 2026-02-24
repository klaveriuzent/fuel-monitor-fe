import { useMemo, useState } from 'react'
import { Watermark } from 'antd'
import dayjs from 'dayjs'

import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import AppSubHeaderDashboard from '../../components/subheader/AppSubHeader.dashboard'

const Dashboard = () => {
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState([null, null])

  // ===========================
  // 1. Data Transaksi
  // ===========================
  const transaksiData = [
    {
      site: 'Depot Jakarta',
      date: '2025-10-28 08:25:12',
      id_card: 'ID00123',
      username: 'operator_jkt1',
      license_plate: 'B 1234 XY',
      odometer: 34500,
      volume: 55.2,
    },
    {
      site: 'Depot Jakarta',
      date: '2025-10-28 09:42:33',
      id_card: 'ID00456',
      username: 'operator_jkt2',
      license_plate: 'B 7890 AB',
      odometer: 50120,
      volume: 63.4,
    },
    {
      site: 'Depot Surabaya',
      date: '2025-10-28 10:15:07',
      id_card: 'ID00999',
      username: 'operator_sby1',
      license_plate: 'L 4567 ZZ',
      odometer: 77200,
      volume: 48.5,
    },
    {
      site: 'Depot Medan',
      date: '2025-10-27 17:45:50',
      id_card: 'ID00888',
      username: 'operator_mdn',
      license_plate: 'BK 1122 DD',
      odometer: 129000,
      volume: 70.8,
    },
  ]

  // ===========================
  // 2. Data Fuel Receive
  // ===========================
  const fuelReceiveData = [
    {
      site: 'Depot Jakarta',
      date: '2025-10-28 07:30:00',
      no_invoice: 'INV-20251028-001',
      no_do: 'DO-00123',
      volume_permintaan: 5000,
      vendor: 'PT Pertamina Patra Niaga',
      license_plate: 'B 9999 FO',
      driver: 'Slamet Riyadi',
    },
    {
      site: 'Depot Surabaya',
      date: '2025-10-27 06:45:00',
      no_invoice: 'INV-20251027-002',
      no_do: 'DO-00456',
      volume_permintaan: 4500,
      vendor: 'PT Shell Indonesia',
      license_plate: 'L 9988 ZZ',
      driver: 'Bambang Setiawan',
    },
    {
      site: 'Depot Medan',
      date: '2025-10-26 09:00:00',
      no_invoice: 'INV-20251026-003',
      no_do: 'DO-00789',
      volume_permintaan: 6000,
      vendor: 'PT Total Energies',
      license_plate: 'BK 3344 CC',
      driver: 'Andi Saputra',
    },
  ]

  // ===========================
  // 3. Data Fuel Stock
  // ===========================
  const fuelStockData = [
    {
      id_tank: 'TK-JKT-01',
      site: 'Depot Jakarta',
      status: 'Online',
      volume_oil: 4200,
      volume_water: 50,
      max_capacity: 8000,
      temperature: 29.1,
      ruang_kosong: 3750,
      last_update: '2025-10-28 10:00:00',
    },
    {
      id_tank: 'TK-JKT-02',
      site: 'Depot Jakarta',
      status: 'Offline',
      volume_oil: 0,
      volume_water: 0,
      max_capacity: 8000,
      temperature: null,
      ruang_kosong: 8000,
      last_update: '2025-10-27 14:30:00',
    },
    {
      id_tank: 'TK-SBY-01',
      site: 'Depot Surabaya',
      status: 'Online',
      volume_oil: 3900,
      volume_water: 60,
      max_capacity: 7000,
      temperature: 30.5,
      ruang_kosong: 3040,
      last_update: '2025-10-28 09:50:00',
    },
    {
      id_tank: 'TK-MDN-01',
      site: 'Depot Medan',
      status: 'Online',
      volume_oil: 5200,
      volume_water: 45,
      max_capacity: 9000,
      temperature: 31.2,
      ruang_kosong: 3755,
      last_update: '2025-10-28 09:10:00',
    },
  ]

  const searchValue = useMemo(() => search.trim().toLowerCase(), [search])

  const filteredTransactions = transaksiData.filter((item) => {
    const matchesText = searchValue
      ? [item.site, item.id_card, item.username, item.license_plate, item.odometer, item.volume]
          .filter((field) => field !== undefined && field !== null)
          .some((field) => field.toString().toLowerCase().includes(searchValue))
      : true

    const [startDate, endDate] = dateRange || []
    const itemDate = dayjs(item.date)
    const matchesDate = startDate
      ? endDate
        ? itemDate.isBetween(startDate.startOf('day'), endDate.endOf('day'), null, '[]')
        : itemDate.isSame(startDate, 'day') || itemDate.isAfter(startDate.startOf('day'))
      : true

    const matchesSite =
      siteFilter === 'all'
        ? true
        : item.site && item.site.toLowerCase() === siteFilter.toLowerCase()

    return matchesText && matchesDate && matchesSite
  })

  const siteTotalCount = filteredTransactions.length

  const dashboardIdeas = useMemo(
    () => [
      {
        title: 'Operational Snapshot',
        priority: 'Now',
        items: [
          'Ringkasan transaksi harian per site + total liter keluar',
          'Tank critical level (<20%) dengan status warna merah/kuning/hijau',
          'Jumlah tank offline atau tidak update >15 menit',
        ],
      },
      {
        title: 'Logistics & Receiving',
        priority: 'Next',
        items: [
          'Jadwal truk masuk hari ini vs realisasi kedatangan',
          'Lead time bongkar per vendor dan deviasi volume invoice vs actual',
          'Riwayat mismatch DO / invoice / volume receive',
        ],
      },
      {
        title: 'Control & Insight',
        priority: 'Later',
        items: [
          'Anomali konsumsi (spike per kendaraan/operator/site)',
          'Forecast stok habis (days to empty) berbasis rata-rata konsumsi',
          'Top 10 kendaraan dengan konsumsi tertinggi + trend mingguan',
        ],
      },
    ],
    [],
  )

  return (
    <>
      <Watermark content="UNDER DEVELOPMENT">
        <AppSubHeaderDashboard
          search={search}
          setSearch={setSearch}
          siteFilter={siteFilter}
          setSiteFilter={setSiteFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          storageKey="appSubHeaderFilters:dashboard"
        />
        <WidgetsDropdown
          className="mb-4"
          fuelReceiveData={fuelReceiveData}
          transaksiData={transaksiData}
          siteTotalCount={siteTotalCount}
        />
        <CCard className="mb-4">
          <CCardBody>
            <h4 className="card-title mb-3">Consumption Trend</h4>
            <MainChart />
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            Rekomendasi Struktur Dashboard{' '}
            <CBadge color="info" className="ms-2">
              Dummy Blueprint
            </CBadge>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {dashboardIdeas.map((section) => (
                <CCol md={4} key={section.title}>
                  <h6 className="fw-semibold d-flex justify-content-between align-items-center">
                    {section.title}
                    <CBadge color="secondary">{section.priority}</CBadge>
                  </h6>
                  <CListGroup className="mb-3">
                    {section.items.map((item) => (
                      <CListGroupItem key={item}>{item}</CListGroupItem>
                    ))}
                  </CListGroup>
                </CCol>
              ))}
            </CRow>
          </CCardBody>
        </CCard>
      </Watermark>
    </>
  )
}

export default Dashboard
