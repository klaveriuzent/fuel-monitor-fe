import { useEffect, useState } from 'react'
import {
  getOfflineRanges,
  getTanggalSortValue,
  isHistoryRowOffline,
  toNullableNumber,
  toNumber,
} from './fuelCardUtils'
import { notifyUnauthorized } from '../../utils/unauthorized'

export const useTankHistory = ({ baseURL, isModalVisible, item, timeScale, isStandby }) => {
  const [fuelData, setFuelData] = useState([])
  const [waterData, setWaterData] = useState([])
  const [totalData, setTotalData] = useState([])
  const [labels, setLabels] = useState([])
  const [offlineMask, setOfflineMask] = useState([])
  const [offlineRanges, setOfflineRanges] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isModalVisible) return undefined

    const controller = new AbortController()
    let isMounted = true

    const fetchHistory = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const params = new URLSearchParams({
          id_site: item.id_site,
          id_tank: item.id_tank,
          filter: timeScale,
        })

        const response = await fetch(`${baseURL}tank/history?${params.toString()}`, {
          signal: controller.signal,
          credentials: 'include',
        })

        if (response.status === 401) {
          notifyUnauthorized()
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch tank history data')
        }

        const payload = await response.json()
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.results)
              ? payload.results
              : []

        const filtered = rows.filter(
          (e) =>
            String(e?.id_tank ?? '') === String(item?.id_tank ?? '') &&
            String(e?.id_site ?? '') === String(item?.id_site ?? ''),
        )

        const sorted = [...filtered].sort((a, b) => {
          const aValue = getTanggalSortValue(a?.tanggal, timeScale)
          const bValue = getTanggalSortValue(b?.tanggal, timeScale)

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return aValue - bValue
          }
          if (typeof aValue === 'number') return -1
          if (typeof bValue === 'number') return 1

          return String(a?.tanggal || '').localeCompare(String(b?.tanggal || ''), 'en', {
            numeric: true,
          })
        })

        const nextLabels = sorted.map((e) => e.tanggal)
        const nextFuelData = sorted.map((e) => toNumber(e.volume_oil))
        const nextWaterData = sorted.map((e) => toNumber(e.volume_air))
        const nextTotalData = sorted.map((e) => toNumber(e.volume_oil) + toNumber(e.volume_air))
        const nextOfflineMask = sorted.map((e) => isHistoryRowOffline(e))

        const snapshotOil = toNullableNumber(item.volume_oil)
        const snapshotWaterRaw = toNullableNumber(item.volume_air)
        const canInjectSnapshot =
          timeScale === 'day' &&
          String(item.aktif_flag ?? '') === '1' &&
          !isStandby() &&
          (snapshotOil !== null || snapshotWaterRaw !== null)

        if (canInjectSnapshot) {
          const snapshotLabel = item.update_date || new Date().toISOString()
          const snapshotFuel = toNumber(item.volume_oil)
          const snapshotWater = toNumber(item.volume_air)
          const snapshotTotal = snapshotFuel + snapshotWater
          const snapshotTime = getTanggalSortValue(snapshotLabel, 'day')
          const lastLabel = nextLabels[nextLabels.length - 1]
          const lastTime = getTanggalSortValue(lastLabel, 'day')

          if (!nextLabels.length) {
            nextLabels.push(snapshotLabel)
            nextFuelData.push(snapshotFuel)
            nextWaterData.push(snapshotWater)
            nextTotalData.push(snapshotTotal)
            nextOfflineMask.push(false)
          } else if (
            typeof snapshotTime === 'number' &&
            typeof lastTime === 'number' &&
            Math.abs(snapshotTime - lastTime) <= 60 * 1000
          ) {
            nextLabels[nextLabels.length - 1] = snapshotLabel
            nextFuelData[nextFuelData.length - 1] = snapshotFuel
            nextWaterData[nextWaterData.length - 1] = snapshotWater
            nextTotalData[nextTotalData.length - 1] = snapshotTotal
            nextOfflineMask[nextOfflineMask.length - 1] = false
          } else if (
            typeof snapshotTime === 'number' &&
            (typeof lastTime !== 'number' || snapshotTime > lastTime)
          ) {
            nextLabels.push(snapshotLabel)
            nextFuelData.push(snapshotFuel)
            nextWaterData.push(snapshotWater)
            nextTotalData.push(snapshotTotal)
            nextOfflineMask.push(false)
          }
        }

        if (isMounted) {
          setLabels(nextLabels)
          setFuelData(nextFuelData)
          setWaterData(nextWaterData)
          setTotalData(nextTotalData)
          setOfflineMask(nextOfflineMask)
          setOfflineRanges(getOfflineRanges(nextOfflineMask))
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error fetching tank history data:', error)
          if (isMounted) {
            setLabels([])
            setFuelData([])
            setWaterData([])
            setTotalData([])
            setOfflineMask([])
            setOfflineRanges([])
            setErrorMessage('Gagal memuat data grafik.')
          }
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [
    baseURL,
    isModalVisible,
    item.aktif_flag,
    item.id_site,
    item.id_tank,
    item.update_date,
    item.volume_air,
    item.volume_oil,
    timeScale,
    isStandby,
  ])

  return {
    fuelData,
    waterData,
    totalData,
    labels,
    offlineMask,
    offlineRanges,
    isLoading,
    errorMessage,
  }
}
