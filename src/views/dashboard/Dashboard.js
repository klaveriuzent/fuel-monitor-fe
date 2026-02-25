import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Watermark } from 'antd'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

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

const baseURL = import.meta.env.VITE_API_BASE_URL
dayjs.extend(isBetween)

const Dashboard = () => {
  /* ───── state ───── */
  const [transaksiData, setTransaksiData] = useState([])
  const [fuelReceiveData, setFuelReceiveData] = useState([])
  const [tankData, setTankData] = useState([])

  const [loadingTrans, setLoadingTrans] = useState(false)
  const [loadingReceive, setLoadingReceive] = useState(false)
  const [loadingTank, setLoadingTank] = useState(false)

  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState([null, null])

  /* ───── fetch transaksi ───── */
  useEffect(() => {
    const fetchTransaksi = async () => {
      try {
        setLoadingTrans(true)
        const { data } = await axios.get(`${baseURL}transaksi`)
        if (Array.isArray(data?.data)) {
          setTransaksiData(
            data.data.map((it, i) => ({
              key: i,
              site: it.id_site,
              date: it.waktu,
              username: it.username,
              license_plate: it.plat,
              volume: parseFloat(it.volume),
            })),
          )
        }
      } catch (err) {
        console.error('Error fetch transaksi', err)
      } finally {
        setLoadingTrans(false)
      }
    }
    fetchTransaksi()
  }, [])

  /* ───── fetch fuel receive ───── */
  useEffect(() => {
    const fetchReceive = async () => {
      try {
        setLoadingReceive(true)
        const { data } = await axios.get(`${baseURL}tankdeliv`)
        if (Array.isArray(data?.data)) {
          setFuelReceiveData(
            data.data.map((it, i) => ({
              key: i,
              site: it.id_site,
              date: it.waktu_mulai_delivery,
              volume: parseFloat(it.volume_permintaan || 0),
            })),
          )
        }
      } catch (err) {
        console.error('Error fetch fuel receive', err)
      } finally {
        setLoadingReceive(false)
      }
    }
    fetchReceive()
  }, [])

  /* ───── fetch ms-tank ───── */
  useEffect(() => {
    const fetchTank = async () => {
      try {
        setLoadingTank(true)
        const { data } = await axios.get(`${baseURL}ms-tank`)
        if (Array.isArray(data?.data)) {
          setTankData(data.data)
        }
      } catch (err) {
        console.error('Error fetch ms-tank', err)
      } finally {
        setLoadingTank(false)
      }
    }
    fetchTank()
  }, [])

  /* ───── filtering helper ───── */
  const searchValue = useMemo(() => search.trim().toLowerCase(), [search])

  /* transaksi filter: text + date */
  const filteredTransaksiTextDate = useMemo(() => {
    return transaksiData.filter((it) => {
      const matchText = searchValue
        ? [it.site, it.username, it.license_plate]
            .filter(Boolean)
            .some((f) => f.toLowerCase().includes(searchValue))
        : true

      const [start, end] = dateRange || []
      const d = dayjs(it.date)
      const matchDate = start
        ? end
          ? d.isBetween(start.startOf('day'), end.endOf('day'), null, '[]')
          : d.isSame(start, 'day') || d.isAfter(start.startOf('day'))
        : true

      return matchText && matchDate
    })
  }, [transaksiData, searchValue, dateRange])

  /* transaksi filter: + site */
  const filteredTransaksi = useMemo(() => {
    if (siteFilter === 'all') return filteredTransaksiTextDate
    return filteredTransaksiTextDate.filter(
      (it) => it.site && it.site.toLowerCase() === siteFilter.toLowerCase(),
    )
  }, [filteredTransaksiTextDate, siteFilter])

  /* fuel receive filter: text + date + site */
  const filteredFuelReceive = useMemo(() => {
    return fuelReceiveData.filter((it) => {
      const matchText = searchValue ? it.site?.toLowerCase().includes(searchValue) : true

      const matchSite =
        siteFilter === 'all' ? true : it.site && it.site.toLowerCase() === siteFilter.toLowerCase()

      const [start, end] = dateRange || []
      const d = dayjs(it.date)
      const matchDate = start
        ? end
          ? d.isBetween(start.startOf('day'), end.endOf('day'), null, '[]')
          : d.isSame(start, 'day') || d.isAfter(start.startOf('day'))
        : true

      return matchText && matchSite && matchDate
    })
  }, [fuelReceiveData, searchValue, siteFilter, dateRange])

  /* count per-site & total */
  const siteTotalCount = filteredTransaksi.length
  const siteCounts = useMemo(() => {
    return filteredTransaksi.reduce((acc, it) => {
      if (!it.site) return acc
      acc[it.site] = (acc[it.site] || 0) + 1
      return acc
    }, {})
  }, [filteredTransaksi])

  /* dashboard idea static */
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

  /* ───── render ───── */
  return (
    <>
      <AppSubHeaderDashboard
        search={search}
        setSearch={setSearch}
        siteFilter={siteFilter}
        setSiteFilter={setSiteFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        storageKey="appSubHeaderFilters:dashboard"
        siteCounts={siteCounts}
        siteTotalCount={siteTotalCount}
      />

      <WidgetsDropdown
        className="mb-4"
        transaksiData={filteredTransaksi}
        fuelReceiveData={filteredFuelReceive}
        stockData={tankData}
      />

      <Watermark content="UNDER DEVELOPMENT">
        <CCard className="mb-4">
          <CCardBody>
            <h4 className="card-title mb-3">Consumption Trend</h4>
            <MainChart data={filteredTransaksi} loading={loadingTrans} />
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
              {dashboardIdeas.map((s) => (
                <CCol md={4} key={s.title}>
                  <h6 className="fw-semibold d-flex justify-content-between align-items-center">
                    {s.title}
                    <CBadge color="secondary">{s.priority}</CBadge>
                  </h6>
                  <CListGroup className="mb-3">
                    {s.items.map((it) => (
                      <CListGroupItem key={it}>{it}</CListGroupItem>
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
