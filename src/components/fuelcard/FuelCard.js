import React, { useState } from 'react'
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

const TankVisual = ({ fuelLevel, waterLevel, capacity, showFuel, showWater }) => {
  const waterPercent = (waterLevel / capacity) * 100
  const fuelPercent = (fuelLevel / capacity) * 100

  const waterHeight = showWater ? waterPercent : 0
  const fuelHeight = showFuel ? fuelPercent : 0

  const totalHeight = waterHeight + fuelHeight
  const totalLiters = fuelLevel + waterLevel

  const tooltipContent = (
    <div>
      <div style={{ fontWeight: 'bold' }}>
        Total: {totalLiters.toLocaleString()}L / {capacity.toLocaleString()}L (
        {totalHeight.toFixed(1)}%)
      </div>
      {showFuel && (
        <div style={{ marginTop: '4px' }}>
          ⛽ Fuel: {fuelLevel.toLocaleString()}L ({fuelPercent.toFixed(1)}%)
        </div>
      )}
      {showWater && (
        <div>
          💧 Water: {waterLevel.toLocaleString()}L ({waterPercent.toFixed(1)}%)
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

        <div className="tank-visual__water" style={{ height: `${waterHeight}%` }}></div>

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
  fuelLevel: PropTypes.number.isRequired,
  waterLevel: PropTypes.number.isRequired,
  capacity: PropTypes.number.isRequired,
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
  fuelLevel: PropTypes.number.isRequired,
  waterLevel: PropTypes.number.isRequired,
  capacity: PropTypes.number.isRequired,
  temperature: PropTypes.string.isRequired,
}

const FuelCard = ({ item }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const baseDate = item.update_date ? new Date(item.update_date) : new Date()
  const dayName = baseDate.toLocaleDateString('id-ID', { weekday: 'long' })
  const day = String(baseDate.getDate()).padStart(2, '0')
  const month = String(baseDate.getMonth() + 1).padStart(2, '0')
  const year = baseDate.getFullYear()

  const hourlyLabels = Array.from({ length: 24 }, (_, index) => {
    const hour = String(index).padStart(2, '0')
    return `${dayName}, ${day}-${month}-${year} ${hour}:00`
  })

  const fuelData = [
    120, 118, 117, 116, 115, 114, 114, 113, 112, 111, 111, 110, 109, 108, 108, 107, 106, 106, 105,
    104, 104, 103, 102, 101,
  ]

  const waterData = [
    12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 20,
  ]

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
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : '-'}{' '}
            </small>
          </CCardText>

          <CButton color="primary" size="sm" onClick={() => setIsModalVisible(true)}>
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
          <div>(Hari, DD-MM-YYYY HH:mm)</div>
        </CModalHeader>
        <CModalBody>
          <CChartLine
            style={{ height: '260px' }}
            data={{
              labels: hourlyLabels,
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
                legend: {
                  display: true,
                  position: 'bottom',
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
                    maxRotation: 0,
                    autoSkip: false,
                    maxTicksLimit: 24,
                    maxRotation: 45,
                    minRotation: 45,
                  },
                },
                y: {
                  beginAtZero: true,
                  border: {
                    color: getStyle('--cui-border-color-translucent'),
                  },
                  grid: {
                    color: getStyle('--cui-border-color-translucent'),
                  },
                  ticks: {
                    color: getStyle('--cui-body-color'),
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.35,
                },
                point: {
                  radius: 2,
                  hitRadius: 6,
                  hoverRadius: 4,
                },
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
    id_tank: PropTypes.string.isRequired,
    aktif_flag: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id_site: PropTypes.string.isRequired,
    ruang_kosong: PropTypes.number.isRequired,
    max_capacity: PropTypes.number.isRequired,
    volume_oil: PropTypes.number.isRequired,
    volume_air: PropTypes.number.isRequired,
    temperature: PropTypes.string.isRequired,
    update_date: PropTypes.string.isRequired,
  }).isRequired,
}

export default FuelCard
