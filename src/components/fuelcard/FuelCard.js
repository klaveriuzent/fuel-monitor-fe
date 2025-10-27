import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Tooltip } from 'antd'
import { FireOutlined, ExperimentOutlined } from '@ant-design/icons'
import { CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'

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
        Total: {totalLiters.toLocaleString()}L / {capacity.toLocaleString()}L ({
          totalHeight.toFixed(1)
        }%)
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
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '160px',
          border: '2px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#f9f9f9',
          cursor: 'pointer',
        }}
      >
        {[0, 25, 50, 75, 100].map((s) => (
          <div
            key={s}
            style={{
              position: 'absolute',
              bottom: `${s}%`,
              left: 0,
              width: '100%',
              height: '1px',
              background: '#555',
              opacity: s === 0 || s === 100 ? 0.5 : 0.3,
            }}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: `${waterHeight}%`,
            background: 'linear-gradient(to top, #3B82F6, #60A5FA)',
            opacity: 0.7,
            transition: 'height 0.6s ease-in-out',
            zIndex: 1,
          }}
        ></div>

        <div
          style={{
            position: 'absolute',
            bottom: `${waterHeight}%`,
            width: '100%',
            height: `${fuelHeight}%`,
            overflow: 'hidden',
            transition: 'height 0.6s ease-in-out, bottom 0.6s ease-in-out',
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to top, #F59E0B, #FBBF24)',
              opacity: 0.7,
            }}
          />
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
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '6px',
        marginLeft: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '160px',
          width: '60px',
          paddingTop: '4px',
          marginRight: '6px',
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#f9f9f9',
            border: '2px solid #ccc',
            borderRadius: '4px',
            marginBottom: '6px',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
          }}
        >
          {temperature} °C
        </div>

        <div
          onClick={() => setShowFuel((p) => !p)}
          style={{
            flex: 1,
            background: showFuel ? '#fff3e0' : '#f9f9f9',
            border: '2px solid #ccc',
            borderRadius: '4px',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FireOutlined
              style={{
                fontSize: '1rem',
                marginTop: '2px',
                color: showFuel ? '#F59E0B' : '#aaa',
              }}
            />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                marginTop: '-2px',
              }}
            >
              Fuel
            </span>
          </div>
        </div>

        <div
          onClick={() => setShowWater((p) => !p)}
          style={{
            flex: 1,
            background: showWater ? '#e0f2fe' : '#f9f9f9',
            border: '2px solid #ccc',
            borderRadius: '4px',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ExperimentOutlined
              style={{
                fontSize: '1rem',
                marginTop: '2px',
                color: showWater ? '#3B82F6' : '#aaa',
              }}
            />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                marginTop: '-2px',
              }}
            >
              Water
            </span>
          </div>
        </div>
      </div>

      <div style={{ width: 'calc(100% - 120px)', minWidth: '100px' }}>
        <TankVisual
          fuelLevel={fuelLevel}
          waterLevel={waterLevel}
          capacity={capacity}
          showFuel={showFuel}
          showWater={showWater}
        />
      </div>

      <div
        style={{
          position: 'relative',
          height: '160px',
          width: '40px',
          marginLeft: '4px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          fontSize: '0.65rem',
          color: '#333',
          fontWeight: '600',
          paddingTop: '20px',
          paddingBottom: '20px',
        }}
      >
        {[75, 50, 25].map((s) => (
          <div
            key={s}
            style={{
              height: '0px',
              display: 'flex',
              alignItems: 'center',
              lineHeight: '1',
            }}
          >
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
    <CCard className="shadow-sm h-full" style={{ height: '100%' }}>
      <CCardBody style={{ padding: '12px' }}>
        <CCardTitle style={{ fontSize: '1rem', marginBottom: '8px' }}>{item.id}</CCardTitle>
        <CCardText style={{ fontSize: '0.85rem' }}>
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

        <CCardText style={{ fontSize: '0.75rem', marginTop: '18px' }}>
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
