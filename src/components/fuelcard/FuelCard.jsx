import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Tooltip } from 'antd'
import { FireOutlined, ExperimentOutlined } from '@ant-design/icons'
import { CCard, CCardBody, CCardTitle, CCardText, CButton } from '@coreui/react'

import FuelCardModalChart from './FuelCardModalChart'
import { clamp, formatDatabaseDateTimeDisplay, getDateTimestamp, toNumber } from './fuelCardUtils'
import { useTankHistory } from './useTankHistory'

import './FuelCard.scss'

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

const FuelCard = ({ item }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [timeScale, setTimeScale] = useState('day')
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  const telemetryStatus = useMemo(() => {
    if (item.aktif_flag !== '1') return { key: 'offline', text: 'Offline', color: 'red' }
    if (!item.update_date) return { key: 'standby', text: 'Standby', color: 'orange' }

    const lastUpdate = getDateTimestamp(item.update_date, 'day')
    if (lastUpdate === null) return { key: 'standby', text: 'Standby', color: 'orange' }

    const diffMinutes = (nowMs - lastUpdate) / 1000 / 60

    if (diffMinutes > 24 * 60) return { key: 'offline', text: 'Offline', color: 'red' }
    if (diffMinutes > 5) return { key: 'standby', text: 'Standby', color: 'orange' }

    return { key: 'online', text: 'Online', color: 'green' }
  }, [item.aktif_flag, item.update_date, nowMs])

  const isStandby = useCallback(() => {
    if (telemetryStatus.key === 'standby') return true
    return telemetryStatus.key === 'offline' && item.aktif_flag === '1'
  }, [item.aktif_flag, telemetryStatus.key])

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const capacity = Number(item.max_capacity) || 0

  const {
    fuelData,
    waterData,
    totalData,
    labels,
    offlineMask,
    offlineRanges,
    isLoading,
    errorMessage,
  } = useTankHistory({
    baseURL,
    isModalVisible,
    item,
    timeScale,
    isStandby,
  })

  const badgeStatus = telemetryStatus

  const renderVolumeValue = (value) => {
    const formatted = Number(value).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    const [integerPart, decimalPart = '00'] = formatted.split(',')

    return (
      <>
        <span className="fuel-card__value-number">
          <span className="fuel-card__value-integer">{integerPart}</span>
          <span className="fuel-card__value-decimal">,{decimalPart}</span>
        </span>{' '}
        L
      </>
    )
  }

  return (
    <Badge.Ribbon text={badgeStatus.text} color={badgeStatus.color}>
      <CCard
        className={`fuel-card shadow-sm h-full${
          badgeStatus.text === 'Standby' || badgeStatus.text === 'Offline'
            ? ' fuel-card--standby fuel-card--offline'
            : ''
        }`}
      >
        <CCardBody className="fuel-card__body">
          <CCardTitle className="fuel-card__title">Fuel Tank {item.id_tank}</CCardTitle>
          <CCardText className="fuel-card__details">
            <b>Site:</b> <br />
            <span className="fuel-card__site-value">{item.id_site}</span>
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
                <tr className="fuel-card__summary-row">
                  <td className="fuel-card__summary-label">
                    <b>Fuel</b>
                  </td>
                  <td className="fuel-card__summary-value">{renderVolumeValue(item.volume_oil)}</td>
                </tr>

                <tr className="fuel-card__summary-row">
                  <td className="fuel-card__summary-label">
                    <b>Water</b>
                  </td>
                  <td className="fuel-card__summary-value">{renderVolumeValue(item.volume_air)}</td>
                </tr>

                <tr className="fuel-card__summary-row">
                  <td className="fuel-card__summary-label">
                    <b>Empty Space</b>
                  </td>
                  <td className="fuel-card__summary-value">
                    {renderVolumeValue(item.ruang_kosong)}
                  </td>
                </tr>

                <tr className="fuel-card__summary-row">
                  <td className="fuel-card__summary-label">
                    <small>Last Response</small>
                  </td>
                  <td className="fuel-card__summary-value">
                    <small>{formatDatabaseDateTimeDisplay(item.update_date)}</small>
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

      <FuelCardModalChart
        item={item}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        labels={labels}
        fuelData={fuelData}
        waterData={waterData}
        totalData={totalData}
        offlineMask={offlineMask}
        offlineRanges={offlineRanges}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isStandby={isStandby()}
        capacity={capacity}
      />
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
