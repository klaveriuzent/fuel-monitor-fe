import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Watermark } from 'antd'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { CCard, CCardBody } from '@coreui/react'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import AppSubHeaderDashboard from '../../components/subheader/AppSubHeader.dashboard'

const baseURL = import.meta.env.VITE_API_BASE_URL
dayjs.extend(isBetween)

const Dashboard = () => {
  /* state */
  const [transaksiData, setTransaksiData] = useState([])
  const [fuelReceiveData, setFuelReceiveData] = useState([])
  const [tankData, setTankData] = useState([])

  const [loadingTrans, setLoadingTrans] = useState(false)
  const [loadingReceive, setLoadingReceive] = useState(false)
  const [loadingTank, setLoadingTank] = useState(false)

  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateRange, setDateRange] = useState([null, null])

  /* fetch transaksi */
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

  /* fetch fuel receive */
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

  /* potongan fetch ms-tank saja yang diubah */
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

  /* helpers */
  const searchValue = useMemo(() => search.trim().toLowerCase(), [search])

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

  const filteredTransaksi = useMemo(() => {
    if (siteFilter === 'all') return filteredTransaksiTextDate
    return filteredTransaksiTextDate.filter(
      (it) => it.site && it.site.toLowerCase() === siteFilter.toLowerCase(),
    )
  }, [filteredTransaksiTextDate, siteFilter])

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

  const siteTotalCount = filteredTransaksi.length
  const siteCounts = useMemo(() => {
    return filteredTransaksi.reduce((acc, it) => {
      if (!it.site) return acc
      acc[it.site] = (acc[it.site] || 0) + 1
      return acc
    }, {})
  }, [filteredTransaksi])

  /* render */
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
        loadingTrans={loadingTrans}
        loadingReceive={loadingReceive}
        loadingStock={loadingTank}
      />

      <Watermark content="UNDER DEVELOPMENT">
        <CCard className="mb-4">
          <CCardBody>
            <h4 className="card-title mb-3">Consumption Trend</h4>
            <MainChart data={filteredTransaksi} loading={loadingTrans} />
          </CCardBody>
        </CCard>
      </Watermark>
    </>
  )
}

export default Dashboard
