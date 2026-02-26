import React, { useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { CRow, CCol, CWidgetStatsA } from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

// normalize active flag
const isAktif = (flag) => {
  if (flag === true) return true
  if (flag === false || flag == null) return false

  const s = String(flag).trim().toLowerCase()
  return ['1', 'true', 'y', 'yes', 'on', 'aktif', 'active'].includes(s)
}

// safe date parse supporting common formats
const parseDateSafe = (value) => {
  if (!value) return null
  if (value instanceof Date) {
    const t = value.getTime()
    return Number.isFinite(t) ? t : null
  }

  const raw = String(value).trim()

  // ISO first
  let t = Date.parse(raw)
  if (Number.isFinite(t)) return t

  // "YYYY-MM-DD HH:mm:ss" → ISO-like
  t = Date.parse(raw.replace(' ', 'T'))
  if (Number.isFinite(t)) return t

  // "DD/MM/YYYY HH:mm:ss" or "DD-MM-YYYY HH:mm:ss"
  const m = raw.match(
    /^([0-9]{2})[\/-]([0-9]{2})[\/-]([0-9]{4})(?:[ T]([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?)?$/,
  )
  if (m) {
    const [, dd, mm, yyyy, HH = '00', MI = '00', SS = '00'] = m
    const dt = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(HH),
      Number(MI),
      Number(SS),
    )
    const ms = dt.getTime()
    return Number.isFinite(ms) ? ms : null
  }

  return null
}

// decide tank status from last_tank_data
const getTankStatus = (item, standbyThresholdMin = 5) => {
  const last = item?.last_tank_data?.[0]
  if (!last) return { key: 'offline' }

  if (!isAktif(last.aktif_flag)) return { key: 'offline' }

  const updMs = parseDateSafe(last.update_date)
  if (!updMs) return { key: 'standby' }

  const diffMin = (Date.now() - updMs) / 60000
  return diffMin > standbyThresholdMin ? { key: 'standby' } : { key: 'online' }
}

/* ── component ------------------------------------------- */

const WidgetsDropdown = ({
  className,
  fuelReceiveData = [],
  transaksiData = [],
  stockData = [], // pastikan ini array: response.data
}) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const widgetChartRef3 = useRef(null)

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
          chart={<div style={{ height: '51.79px' }} />}
          // chart={
          //   <CChartLine
          //     ref={widgetChartRef1}
          //     className="mt-3 mx-3"
          //     style={{ height: '70px' }}
          //     data={{
          //       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          //       datasets: [
          //         {
          //           backgroundColor: 'transparent',
          //           borderColor: 'rgba(255,255,255,.55)',
          //           pointBackgroundColor: getStyle('--cui-primary'),
          //           data: [65, 59, 84, 84, 51, 55, 40],
          //         },
          //       ],
          //     }}
          //     options={{
          //       plugins: { legend: { display: false } },
          //       maintainAspectRatio: false,
          //       scales: {
          //         x: { grid: { display: false }, ticks: { display: false } },
          //         y: { display: false },
          //       },
          //       elements: { line: { borderWidth: 1, tension: 0.4 }, point: { radius: 4 } },
          //     }}
          //   />
          // }
        />
      </CCol>

      {/* FUEL RECEIVED */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info"
          value={`${totalFuelReceived} records`}
          title="Fuel Received"
          chart={<div style={{ height: '51.79px' }} />}
          // chart={
          //   <CChartLine
          //     ref={widgetChartRef2}
          //     className="mt-3 mx-3"
          //     style={{ height: '70px' }}
          //     data={{
          //       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          //       datasets: [
          //         {
          //           backgroundColor: 'transparent',
          //           borderColor: 'rgba(255,255,255,.55)',
          //           pointBackgroundColor: getStyle('--cui-info'),
          //           data: [1, 18, 9, 17, 34, 22, 11],
          //         },
          //       ],
          //     }}
          //     options={{
          //       plugins: { legend: { display: false } },
          //       maintainAspectRatio: false,
          //       scales: {
          //         x: { grid: { display: false }, ticks: { display: false } },
          //         y: { display: false },
          //       },
          //       elements: { line: { borderWidth: 1 }, point: { radius: 4 } },
          //     }}
          //   />
          // }
        />
      </CCol>

      {/* FUEL STOCK */}
      <CCol sm={12} xl={4} xxl={6}>
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-semibold">Machine</h6>
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
