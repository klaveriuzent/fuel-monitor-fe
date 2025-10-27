import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Tooltip } from 'antd'
import { FireOutlined, ExperimentOutlined } from '@ant-design/icons'
import { CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'

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

const FuelCard = ({ item }) => (
  <Badge.Ribbon text={item.status} color={item.status === 'Online' ? 'green' : 'red'}>
    <CCard className="fuel-card shadow-sm h-full">
      <CCardBody className="fuel-card__body">
        <CCardTitle className="fuel-card__title">{item.id}</CCardTitle>
        <CCardText className="fuel-card__details">
          <b>Type:</b> {item.type} <br />
          <b>Site:</b> {item.site} <br />
          <b>Tank Height:</b> {item.tankHeight} cm <br />
          <b>Capacity:</b> {item.capacity} L
        </CCardText>

        <TankWithScale
          fuelLevel={item.fuelLevel}
          waterLevel={item.waterLevel}
          capacity={item.capacity}
          temperature={item.temperature}
        />

        <CCardText className="fuel-card__summary">
          <b>Fuel:</b> {item.fuelLevel} L
          <br />
          <b>Water:</b> {item.waterLevel} L
          <br />
          <small>Last Updated: {item.lastUpdated}</small>
        </CCardText>
      </CCardBody>
    </CCard>
  </Badge.Ribbon>
)

FuelCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    site: PropTypes.string.isRequired,
    tankHeight: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    fuelLevel: PropTypes.number.isRequired,
    waterLevel: PropTypes.number.isRequired,
    temperature: PropTypes.string.isRequired,
    lastUpdated: PropTypes.string.isRequired,
  }).isRequired,
}

export default FuelCard
