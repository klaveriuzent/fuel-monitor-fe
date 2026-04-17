import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
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

  useEffect(() => {
    const runSSOValidation = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('t') || ''
      if (!token) return

      try {
        const res = await fetch(`${baseURL}auth/sso_validate?t=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        })
        const json = await res.json()

        if (!res.ok) {
          alert(json?.message || 'Authorization has been denied for this request.')
          window.location.href = '/fuelmonitoring/login'
          return
        }

        const username = json?.data?.username || ''
        const fullName = json?.data?.full_name || ''
        if (username) localStorage.setItem('username', username)
        if (fullName) localStorage.setItem('full_name', fullName)
        localStorage.setItem(
          'user-data',
          JSON.stringify({
            UserName: username,
            FullName: fullName,
          }),
        )

        window.history.replaceState({}, '', '/fuelmonitoring/dashboard')
      } catch (error) {
        console.error('SSO validation error', error)
        alert('Authorization has been denied for this request.')
        window.location.href = '/fuelmonitoring/login'
      }
    }

    runSSOValidation()
  }, [])

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

  const filteredTankData = useMemo(() => {
    if (siteFilter === 'all') return tankData

    const targetSite = String(siteFilter).toLowerCase()
    return tankData.filter((item) => {
      const siteFromRoot = String(item?.id_site || '').toLowerCase()
      const siteFromLast = String(item?.last_tank_data?.[0]?.id_site || '').toLowerCase()
      return siteFromRoot === targetSite || siteFromLast === targetSite
    })
  }, [tankData, siteFilter])

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
        stockData={filteredTankData}
        loadingTrans={loadingTrans}
        loadingReceive={loadingReceive}
        loadingStock={loadingTank}
      />

      <CCard className="mb-4">
        <CCardBody>
          <h4 className="card-title mb-3">Consumption Trend</h4>
          <MainChart data={filteredTransaksi} loading={loadingTrans} dateRange={dateRange} />
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard
