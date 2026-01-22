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
        <div style={{ marginTop: '4px' }}>
          ⛽ Fuel: {fuel.toLocaleString()}L ({fuelPercent.toFixed(1)}%)
        </div>
      )}
      {showWater && (
        <div>
          💧 Water: {water.toLocaleString()}L ({waterPercent.toFixed(1)}%)
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

const FuelCard = ({ item }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [timeScale, setTimeScale] = useState('day')
  const [fuelData, setFuelData] = useState([])
  const [waterData, setWaterData] = useState([])
  const [labels, setLabels] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const baseURL = import.meta.env.VITE_API_BASE_URL

  const formatAxisLabel = (dateValue, scale) => {
    if (!dateValue) return ''

    const d = new Date(dateValue)

    // DAY → jam
    if (scale === 'day') {
      // "YYYY-MM-DD HH:00:00" → HH:mm
      return String(dateValue).slice(11, 16)
    }

    if (scale === 'week') {
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: '2-digit',
      })
    }

    // MONTH → tanggal saja
    if (scale === 'month') {
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
      })
    }

    return ''
  }

  const formatTooltipLabel = (dateValue, scale) => {
    if (!dateValue) return ''
    if (scale === 'day') {
      return new Date(dateValue).toLocaleString('id-ID', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
    }
    return new Date(dateValue).toLocaleDateString('id-ID', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  }

  const chartMax = useMemo(() => {
    const cap = toNumber(item.max_capacity)
    return cap > 0 ? cap : undefined
  }, [item.max_capacity])

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

        const data = await response.json()
        const rows = Array.isArray(data) ? data : []

        // Backend filtered-history seharusnya sudah sesuai id_tank,
        // tapi tetap kita jaga biar aman.
        const filtered = rows.filter((e) => String(e.id_tank) === String(item.id_tank))

        // Sort aman untuk day/week/month (string bucket tetap bisa di Date)
        const sorted = [...filtered].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))

        const nextLabels = sorted.map((e) => e.tanggal)
        const nextFuelData = sorted.map((e) => toNumber(e.tinggi_oil))
        const nextWaterData = sorted.map((e) => toNumber(e.tinggi_air))

        if (isMounted) {
          setLabels(nextLabels)
          setFuelData(nextFuelData)
          setWaterData(nextWaterData)
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error fetching tank history data:', error)
          if (isMounted) {
            setLabels([])
            setFuelData([])
            setWaterData([])
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
    <Badge.Ribbon
      text={item.aktif_flag === '1' ? 'Online' : 'Offline'}
      color={item.aktif_flag === '1' ? 'green' : 'red'}
    >
      <CCard className="fuel-card shadow-sm h-full">
        <CCardBody className="fuel-card__body">
          <CCardTitle className="fuel-card__title">Tank {item.id_tank}</CCardTitle>
          <CCardText className="fuel-card__details">
            <b>Site:</b> {item.id_site} <br />
            <b>Capacity:</b> {item.max_capacity} L
          </CCardText>

          <TankWithScale
            fuelLevel={item.volume_oil}
            waterLevel={item.volume_air}
            capacity={item.max_capacity}
            temperature={item.temperature}
          />

          <CCardText className="fuel-card__summary">
            <b>Fuel:</b> {item.volume_oil} L
            <br />
            <b>Water:</b> {item.volume_air} L
            <br />
            <b>Empty Space:</b> {item.ruang_kosong} L
            <br />
            <small>
              Last Updated:{' '}
              {item.update_date
                ? new Date(item.update_date).toLocaleString('en-GB', {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : '-'}
            </small>
          </CCardText>

          <CButton
            color="primary"
            size="sm"
            onClick={() => {
              setTimeScale('day')
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
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'bottom' },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  callbacks: {
                    label: (context) => {
                      if (context.datasetIndex !== 0) return null
                      const idx = context.dataIndex
                      const fuelValue = fuelData[idx] ?? 0
                      const waterValue = waterData[idx] ?? 0
                      const labelDate = labels[idx]

                      return [
                        `Fuel: ${fuelValue} L`,
                        `Water: ${waterValue} L`,
                        `Time: ${formatTooltipLabel(labelDate, timeScale)}`,
                      ]
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
                    maxTicksLimit: timeScale === 'day' ? 24 : 7,
                    maxRotation: 45,
                    minRotation: 45,
                    callback: (_, index) => formatAxisLabel(labels[index], timeScale),
                  },
                },
                y: {
                  min: 0,
                  max: 20000,
                  ticks: {
                    stepSize: 4000,
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
