import React, { useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { CRow, CCol, CWidgetStatsA } from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

/* ── generic detector ------------------------------------ */
// ambil nilai flag aktif (cari key mengandung 'aktif' / 'active')
const extractAktifFlag = (item) => {
  for (const [k, v] of Object.entries(item)) {
    const key = k.toLowerCase()
    if (key.includes('aktif') && !key.includes('update')) return v
    if (key.includes('active')) return v
  }
  return undefined
}

// ambil timestamp update (cari key mengandung 'update' / 'timestamp')
const extractUpdateTime = (item) => {
  for (const [k, v] of Object.entries(item)) {
    const key = k.toLowerCase()
    if (key.includes('update') || key.includes('timestamp')) return v
  }
  return null
}

const isAktif = (flag) => ['1', 1, true, 'y', 'yes', 'on'].includes(flag)

const isStandby = (item) => {
  const upd = extractUpdateTime(item)
  if (!isAktif(extractAktifFlag(item)) || !upd) return false
  const diffMin = (Date.now() - new Date(upd).getTime()) / 60000
  return diffMin > 5
}

const getTankStatus = (item) => {
  if (!isAktif(extractAktifFlag(item))) return { key: 'offline' }
  return isStandby(item) ? { key: 'standby' } : { key: 'online' }
}

/* ── component ------------------------------------------- */
const WidgetsDropdown = ({
  className,
  fuelReceiveData = [],
  transaksiData = [],
  stockData = [],
}) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const widgetChartRef3 = useRef(null)

  /* debug raw data */
  useEffect(() => {
    console.log('<<< STOCK DATA RECEIVED >>>', stockData)
  }, [stockData])

  /* totals */
  const totalTransactions = transaksiData.length
  const totalFuelReceived = fuelReceiveData.length

  /* count online / standby */
  const { onlineStock, standbyStock } = useMemo(() => {
    let online = 0
    let standby = 0
    stockData.forEach((t) => {
      const st = getTankStatus(t).key
      if (st === 'online') online += 1
      else if (st === 'standby') standby += 1
    })
    console.log('Recalculate stock:', { online, standby })
    return { onlineStock: online, standbyStock: standby }
  }, [stockData])

  /* sync chart colour on theme change */
  useEffect(() => {
    const handler = () => {
      if (widgetChartRef1.current) {
        widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
        widgetChartRef1.current.update()
      }
      if (widgetChartRef2.current) {
        widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
        widgetChartRef2.current.update()
      }
      if (widgetChartRef3.current) {
        widgetChartRef3.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-warning')
        widgetChartRef3.current.update()
      }
    }
    document.documentElement.addEventListener('ColorSchemeChange', handler)
    return () => document.documentElement.removeEventListener('ColorSchemeChange', handler)
  }, [])

  /* render */
  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      {/* TOTAL TRANSACTIONS */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="primary"
          value={`${totalTransactions} records`}
          title="Total Transactions"
          chart={
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: [65, 59, 84, 84, 51, 55, 40],
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { display: false } },
                  y: { display: false },
                },
                elements: { line: { borderWidth: 1, tension: 0.4 }, point: { radius: 4 } },
              }}
            />
          }
        />
      </CCol>

      {/* FUEL RECEIVED */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info"
          value={`${totalFuelReceived} records`}
          title="Fuel Received"
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [1, 18, 9, 17, 34, 22, 11],
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { display: false } },
                  y: { display: false },
                },
                elements: { line: { borderWidth: 1 }, point: { radius: 4 } },
              }}
            />
          }
        />
      </CCol>

      {/* FUEL STOCK */}
      <CCol sm={12} xl={4} xxl={6}>
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-semibold">Fuel Stock</h6>
            </div>

            <div className="d-flex justify-content-around align-items-center text-center">
              <div>
                <div className="fs-3 fw-bold text-success">{onlineStock}</div>
                <div className="text-success small fw-semibold">Online</div>
              </div>

              <div className="border-start" style={{ height: '45px' }} />

              <div>
                <div className="fs-3 fw-bold text-secondary">{standbyStock}</div>
                <div className="text-muted small">Stand-by</div>
              </div>
            </div>
          </div>
        </div>
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  fuelReceiveData: PropTypes.array,
  transaksiData: PropTypes.array,
  stockData: PropTypes.array,
}

export default WidgetsDropdown
