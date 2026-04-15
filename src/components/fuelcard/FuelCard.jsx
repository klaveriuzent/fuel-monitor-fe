import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Tooltip } from 'antd'
import { FireOutlined, ExperimentOutlined } from '@ant-design/icons'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

import './FuelCard.scss'

const toNumber = (v) => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

const TankVisual = ({ fuelLevel, waterLevel, capacity, showFuel, showWater }) => {
  const safeCapacity = Math.max(1, toNumber(capacity))
  const fuel = clamp(toNumber(fuelLevel), 0, safeCapacity)
  const water = clamp(toNumber(waterLevel), 0, safeCapacity)

  const waterPercent = (water / safeCapacity) * 100
  const fuelPercent = (fuel / safeCapacity) * 100

  const waterHeight = showWater ? waterPercent : 0
  const fuelHeight = showFuel ? fuelPercent : 0

  const totalHeight = clamp(waterHeight + fuelHeight, 0, 100)
  const totalLiters = fuel + water

  const tooltipContent = (
    <div>
      <div style={{ fontWeight: 'bold' }}>
        Total: {totalLiters.toLocaleString()}L / {safeCapacity.toLocaleString()}L (
        {totalHeight.toFixed(1)}%)
      </div>

      {showFuel && (
        <div
          style={{
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Fuel</span>
          <span>
            {Number(fuel).toLocaleString('id-ID', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            L ({fuelPercent.toFixed(1)}%)
          </span>
        </div>
      )}

      {showWater && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Water</span>
          <span>
            {Number(water).toLocaleString('id-ID', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            L ({waterPercent.toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  )

  return (
    <Tooltip title={tooltipContent} placement="top">
      <div className="tank-visual">
        {[0, 25, 50, 75, 100].map((s) => (
          <div
            key={s}
            className={`tank-visual__gridline${s === 0 || s === 100 ? ' tank-visual__gridline--edge' : ''}`}
            style={{ bottom: `${s}%` }}
          />
        ))}

        <div className="tank-visual__water" style={{ height: `${waterHeight}%` }} />

        <div
          className="tank-visual__fuel"
          style={{
            height: `${fuelHeight}%`,
            bottom: `${waterHeight}%`,
          }}
        >
          <div className="tank-visual__fuel-fill" />
        </div>
      </div>
    </Tooltip>
  )
}

TankVisual.propTypes = {
  fuelLevel: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  waterLevel: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  capacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  showFuel: PropTypes.bool.isRequired,
  showWater: PropTypes.bool.isRequired,
}

const TankWithScale = ({ fuelLevel, waterLevel, capacity, temperature }) => {
  const [showFuel, setShowFuel] = useState(true)
  const [showWater, setShowWater] = useState(true)

  const handleFuelKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setShowFuel((prev) => !prev)
    }
  }

  const handleWaterKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setShowWater((prev) => !prev)
    }
  }

  return (
    <div className="tank-with-scale">
      <div className="tank-with-scale__controls">
        <div className="tank-with-scale__temperature">{temperature} °C</div>

        <div
          className={`fuel-card__toggle fuel-card__toggle--fuel${showFuel ? ' is-active' : ''}`}
          onClick={() => setShowFuel((prev) => !prev)}
          onKeyDown={handleFuelKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className="fuel-card__toggle-content">
            <FireOutlined className="fuel-card__toggle-icon fuel-card__toggle-icon--fuel" />
            <span className="fuel-card__toggle-label">Fuel</span>
          </div>
        </div>

        <div
          className={`fuel-card__toggle fuel-card__toggle--water${showWater ? ' is-active' : ''}`}
          onClick={() => setShowWater((prev) => !prev)}
          onKeyDown={handleWaterKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className="fuel-card__toggle-content">
            <ExperimentOutlined className="fuel-card__toggle-icon fuel-card__toggle-icon--water" />
            <span className="fuel-card__toggle-label">Water</span>
          </div>
        </div>
      </div>

      <div className="tank-with-scale__visual">
        <TankVisual
          fuelLevel={fuelLevel}
          waterLevel={waterLevel}
          capacity={capacity}
          showFuel={showFuel}
          showWater={showWater}
        />
      </div>

      <div className="tank-with-scale__markers">
        {[75, 50, 25].map((s) => (
          <div key={s} className="tank-with-scale__marker">
            {s}%
          </div>
        ))}
      </div>
    </div>
  )
}

TankWithScale.propTypes = {
  fuelLevel: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  waterLevel: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  capacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  temperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

const getNiceStep = (capacity, targetTicks = 4) => {
  if (!capacity) return 1000

  const roughStep = capacity / targetTicks
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const residual = roughStep / magnitude

  let niceResidual
  if (residual >= 5) niceResidual = 5
  else if (residual >= 2) niceResidual = 2
  else niceResidual = 1

  return niceResidual * magnitude
}

const getTanggalSortValue = (tanggal, scale) => {
  if (!tanggal) return null

  const parsed = new Date(tanggal)
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime()

  const raw = String(tanggal).trim()
  const parsedIsoLike = new Date(raw.replace(' ', 'T'))
  if (!Number.isNaN(parsedIsoLike.getTime())) return parsedIsoLike.getTime()

  if (scale === 'month') {
    const monthMatch = raw.match(/^(\d{4})-(\d{2})$/)
    if (monthMatch) {
      const [, y, m] = monthMatch
      return Date.UTC(Number(y), Number(m) - 1, 1)
    }
  }

  if (scale === 'week') {
    const weekMatch = raw.match(/^(\d{4})-W(\d{1,2})$/i)
    if (weekMatch) {
      const [, y, w] = weekMatch
      return Date.UTC(Number(y), 0, 1 + (Number(w) - 1) * 7)
    }
  }

  return null
}

const parseTanggalByScale = (dateValue, scale) => {
  if (!dateValue) return null
  const parsed = new Date(dateValue)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const raw = String(dateValue).trim()
  const parsedIsoLike = new Date(raw.replace(' ', 'T'))
  if (!Number.isNaN(parsedIsoLike.getTime())) return parsedIsoLike

  if (scale === 'month') {
    const monthMatch = raw.match(/^(\d{4})-(\d{2})$/)
    if (monthMatch) {
      const [, y, m] = monthMatch
      return new Date(Number(y), Number(m) - 1, 1)
    }
  }

  if (scale === 'week') {
    const weekMatch = raw.match(/^(\d{4})-W(\d{1,2})$/i)
    if (weekMatch) {
      const [, y, w] = weekMatch
      return new Date(Number(y), 0, 1 + (Number(w) - 1) * 7)
    }
  }

  return null
}

const FuelCard = ({ item }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [timeScale, setTimeScale] = useState('day')
  const [fuelData, setFuelData] = useState([])
  const [waterData, setWaterData] = useState([])
  const [totalData, setTotalData] = useState([])
  const [labels, setLabels] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const baseURL = import.meta.env.VITE_API_BASE_URL

  const formatTooltipLabel = (dateValue, scale) => {
    if (!dateValue) return ''
    const parsedDate = new Date(dateValue)
    const isValidDate = !Number.isNaN(parsedDate.getTime())

    if (!isValidDate) {
      return String(dateValue)
    }

    if (scale === 'day') {
      return parsedDate.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
    }
    return parsedDate.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  }

  const formatXAxisLabel = (dateValue, scale) => {
    if (!dateValue) return ''
    const parsedDate = parseTanggalByScale(dateValue, scale)
    if (!parsedDate) return String(dateValue)

    if (scale === 'week' || scale === 'month') {
      return parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    }

    const monthDay = parsedDate.toLocaleDateString('id-ID', {
      month: 'short',
      day: '2-digit',
    })
    const hourMinute = parsedDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })

    return `${monthDay} ${hourMinute}`
  }

  const isStandby = () => {
    if (item.aktif_flag !== '1' || !item.update_date) return false

    const lastUpdate = new Date(item.update_date).getTime()
    const now = Date.now()
    const diffMinutes = (now - lastUpdate) / 1000 / 60

    return diffMinutes > 5
  }

  const capacity = Number(item.max_capacity) || 0
  const max = Math.ceil(capacity / 1000) * 1000
  const step = max / 4

  const badgeStatus = isStandby()
    ? { text: 'Standby', color: 'orange' }
    : item.aktif_flag === '1'
      ? { text: 'Online', color: 'green' }
      : { text: 'Offline', color: 'red' }

  useEffect(() => {
    if (!isModalVisible) return undefined

    let isMounted = true
    const controller = new AbortController()

    const fetchHistory = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const params = new URLSearchParams({
          id_site: item.id_site,
          id_tank: item.id_tank,
          filter: timeScale, // day | week | month
        })

        const response = await fetch(`${baseURL}tank/history?${params.toString()}`, {
          signal: controller.signal,
        })

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

        // Backend biasanya sudah terfilter, tapi tetap dijaga biar tidak
        // tercampur antar site jika ada id_tank yang sama.
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

        if (isMounted) {
          setLabels(nextLabels)
          setFuelData(nextFuelData)
          setWaterData(nextWaterData)
          setTotalData(nextTotalData)
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error fetching tank history data:', error)
          if (isMounted) {
            setLabels([])
            setFuelData([])
            setWaterData([])
            setTotalData([])
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
  }, [baseURL, isModalVisible, item.id_site, item.id_tank, timeScale])

  return (
    <Badge.Ribbon text={badgeStatus.text} color={badgeStatus.color}>
      <CCard className="fuel-card shadow-sm h-full">
        <CCardBody className="fuel-card__body">
          <CCardTitle className="fuel-card__title">Tank {item.id_tank}</CCardTitle>
          <CCardText className="fuel-card__details">
            <b>Site:</b> {item.id_site} <br />
            <b>Tank Capacity:</b> {Number(item.max_capacity).toLocaleString('id-ID')} L
          </CCardText>

          <TankWithScale
            fuelLevel={item.volume_oil}
            waterLevel={item.volume_air}
            capacity={item.max_capacity}
            temperature={item.temperature}
          />

          <div className="fuel-card__summary">
            <table>
              <tbody>
                <tr>
                  <td style={{ width: '90px' }}>
                    <b>Fuel</b>
                  </td>
                  <td style={{ width: '90px' }}>
                    {Number(item.volume_oil).toLocaleString('id-ID', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    L
                  </td>
                </tr>

                <tr>
                  <td style={{ width: '90px' }}>
                    <b>Water</b>
                  </td>
                  <td style={{ width: '90px' }}>
                    {Number(item.volume_air).toLocaleString('id-ID', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    L
                  </td>
                </tr>

                <tr>
                  <td style={{ width: '90px' }}>
                    <b>Empty Space</b>
                  </td>
                  <td style={{ width: '90px' }}>
                    {Number(item.ruang_kosong).toLocaleString('id-ID', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    L
                  </td>
                </tr>

                <tr>
                  <td style={{ width: '90px' }}>
                    <small>Last Updated</small>
                  </td>
                  <td style={{ width: '90px' }}>
                    <small>
                      {item.update_date
                        ? new Date(item.update_date).toLocaleString('en-GB', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : '-'}
                    </small>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <CButton
            color="primary"
            size="sm"
            onClick={() => {
              setIsModalVisible(true)
            }}
          >
            Lihat Grafik
          </CButton>
        </CCardBody>
      </CCard>

      <CModal
        alignment="center"
        size="lg"
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>
            Tank {item.id_tank} - {item.id_site}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            <strong>Time Scale:</strong>
            {[
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
            ].map((option) => (
              <label key={option.value} className="d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name={`time-scale-${item.id_tank}`}
                  value={option.value}
                  checked={timeScale === option.value}
                  onChange={() => setTimeScale(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          {isLoading && <div className="mb-2">Loading chart...</div>}
          {errorMessage && <div className="mb-2 text-danger">{errorMessage}</div>}

          <CChartLine
            style={{ height: '260px' }}
            data={{
              labels,
              datasets: [
                {
                  label: 'Fuel',
                  backgroundColor: `rgba(${getStyle('--cui-warning-rgb')}, .1)`,
                  borderColor: getStyle('--cui-warning'),
                  pointHoverBackgroundColor: getStyle('--cui-warning'),
                  borderWidth: 2,
                  data: fuelData,
                  fill: true,
                },
                {
                  label: 'Water',
                  backgroundColor: 'transparent',
                  borderColor: getStyle('--cui-info'),
                  pointHoverBackgroundColor: getStyle('--cui-info'),
                  borderWidth: 2,
                  data: waterData,
                },
                {
                  label: 'Total',
                  backgroundColor: 'transparent',
                  borderColor: getStyle('--cui-success'),
                  pointHoverBackgroundColor: getStyle('--cui-success'),
                  borderWidth: 2,
                  borderDash: [6, 4],
                  data: totalData,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'bottom' },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  yAlign: 'center',
                  callbacks: {
                    title: (items) => {
                      const idx = items?.[0]?.dataIndex ?? 0
                      const dateValue = labels[idx]
                      return `Time: ${formatTooltipLabel(dateValue, timeScale)}`
                    },
                    label: (context) => {
                      const v = context.parsed?.y ?? 0
                      const label = context.dataset.label
                      return `${label}: ${Number(v).toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} L`
                    },
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    color: getStyle('--cui-border-color-translucent'),
                    drawOnChartArea: false,
                  },
                  ticks: {
                    color: getStyle('--cui-body-color'),
                    autoSkip: timeScale !== 'day',
                    maxRotation: 45,
                    minRotation: 45,
                    callback: function (value, index) {
                      const labelFromChart =
                        typeof this.getLabelForValue === 'function'
                          ? this.getLabelForValue(value)
                          : undefined
                      const rawLabel = labelFromChart ?? labels[index] ?? value
                      return formatXAxisLabel(rawLabel, timeScale)
                    },
                  },
                },
                y: {
                  min: 0,
                  max: max,
                  ticks: {
                    stepSize: step,
                    color: getStyle('--cui-body-color'),
                    callback: (value) => `${value} L`,
                  },
                  border: {
                    color: getStyle('--cui-border-color-translucent'),
                  },
                  grid: {
                    color: getStyle('--cui-border-color-translucent'),
                  },
                },
              },
              elements: {
                line: { tension: 0.35 },
                point: { radius: 2, hitRadius: 6, hoverRadius: 4 },
              },
            }}
          />
        </CModalBody>
      </CModal>
    </Badge.Ribbon>
  )
}

FuelCard.propTypes = {
  item: PropTypes.shape({
    id_tank: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    aktif_flag: PropTypes.string.isRequired,
    type: PropTypes.string,
    id_site: PropTypes.string.isRequired,
    ruang_kosong: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    max_capacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    volume_oil: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    volume_air: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    temperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    update_date: PropTypes.string,
  }).isRequired,
}

export default FuelCard
