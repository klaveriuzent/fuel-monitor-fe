import React, { useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { CRow, CCol, CWidgetStatsA, CSpinner } from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { getStyle } from '@coreui/utils'
import { useNavigate } from 'react-router-dom'

const DASHBOARD_FILTER_STORAGE_KEY = 'appSubHeaderFilters:dashboard'
const TRANSACTIONS_FILTER_STORAGE_KEY = 'appSubHeaderFilters:transactions'
const FUEL_RECEIVE_FILTER_STORAGE_KEY = 'appSubHeaderFilters:fuelReceive'

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

  // "YYYY-MM-DD HH:mm:ss(.SSS)" (with optional timezone suffix) -> treat as DB-local wall time
  const ymd = raw.match(
    /^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:[ T]([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.([0-9]{1,6}))?)?)?(?:Z|[+-][0-9]{2}:?[0-9]{2})?$/,
  )
  if (ymd) {
    const [, yyyy, mm, dd, HH = '00', MI = '00', SS = '00', frac = '0'] = ymd
    const ms = Number(frac.slice(0, 3).padEnd(3, '0'))
    const dt = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(HH),
      Number(MI),
      Number(SS),
      ms,
    )
    const ts = dt.getTime()
    if (Number.isFinite(ts)) return ts
  }

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
const getTankStatus = (item, standbyThresholdMin = 5, offlineThresholdMin = 24 * 60) => {
  const last = item?.last_tank_data?.[0]
  if (!last) {
    const rawCapacity = Number(item?.total_liter ?? 0)
    const hasCapacity = Number.isFinite(rawCapacity) && rawCapacity > 0
    const activeMasterTank = isAktif(item?.is_active)
    return { key: hasCapacity && activeMasterTank ? 'standby' : 'offline' }
  }

  if (!isAktif(last.aktif_flag)) return { key: 'offline' }

  const updMs = parseDateSafe(last.update_date)
  if (!updMs) return { key: 'standby' }

  const diffMin = (Date.now() - updMs) / 60000
  if (diffMin > offlineThresholdMin) return { key: 'offline' }
  return diffMin > standbyThresholdMin ? { key: 'standby' } : { key: 'online' }
}

/* ── component ------------------------------------------- */

const WidgetsDropdown = ({
  className,
  fuelReceiveData = [],
  transaksiData = [],
  stockData = [], // pastikan ini array: response.data
  siteFilter = 'all',
  dateRange = null,
  loadingTrans = false,
  loadingReceive = false,
  loadingStock = false,
}) => {
  const navigate = useNavigate()
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const widgetChartRef3 = useRef(null)

  /* totals */
  const totalTransactions = transaksiData.length
  const totalFuelReceived = fuelReceiveData.length
  const renderMetricValue = (isLoading, text) =>
    isLoading ? (
      <span className="d-inline-flex align-items-center gap-2">
        <CSpinner size="sm" color="light" />
        Loading...
      </span>
    ) : (
      text
    )

  /* count online / standby / offline */
  const { onlineStock, standbyStock, offlineStock } = useMemo(() => {
    let online = 0
    let standby = 0
    let offline = 0
    stockData.forEach((t) => {
      const st = getTankStatus(t).key
      if (st === 'online') online += 1
      else if (st === 'standby') standby += 1
      else if (st === 'offline') offline += 1
    })
    return { onlineStock: online, standbyStock: standby, offlineStock: offline }
  }, [stockData])

  const handleStockStatusClick = (status) => {
    if (loadingStock) return

    navigate('/fuel-stock', {
      state: {
        siteFilter,
        statusFilter: status,
      },
    })
  }

  const handleTransactionsClick = () => {
    if (loadingTrans) return

    let quickRange = null
    let nextDateRange = Array.isArray(dateRange) ? dateRange : null

    try {
      const savedDashboardFilters = JSON.parse(
        localStorage.getItem(DASHBOARD_FILTER_STORAGE_KEY) || 'null',
      )
      quickRange = savedDashboardFilters?.quickRange ?? null

      if (!nextDateRange && Array.isArray(savedDashboardFilters?.dateRange)) {
        nextDateRange = savedDashboardFilters.dateRange
      }
    } catch {
      quickRange = null
    }

    localStorage.setItem(
      TRANSACTIONS_FILTER_STORAGE_KEY,
      JSON.stringify({
        search: '',
        siteFilter,
        quickRange,
        dateRange: nextDateRange?.map((value) =>
          value && typeof value.toISOString === 'function' ? value.toISOString() : value,
        ),
      }),
    )

    navigate('/transactions', {
      state: {
        search: '',
        siteFilter,
        quickRange,
        dateRange: nextDateRange?.map((value) =>
          value && typeof value.toISOString === 'function' ? value.toISOString() : value,
        ),
      },
    })
  }

  const handleFuelReceiveClick = () => {
    if (loadingReceive) return

    let quickRange = null
    let nextDateRange = Array.isArray(dateRange) ? dateRange : null

    try {
      const savedDashboardFilters = JSON.parse(
        localStorage.getItem(DASHBOARD_FILTER_STORAGE_KEY) || 'null',
      )
      quickRange = savedDashboardFilters?.quickRange ?? null

      if (!nextDateRange && Array.isArray(savedDashboardFilters?.dateRange)) {
        nextDateRange = savedDashboardFilters.dateRange
      }
    } catch {
      quickRange = null
    }

    const serializedDateRange = nextDateRange?.map((value) =>
      value && typeof value.toISOString === 'function' ? value.toISOString() : value,
    )

    localStorage.setItem(
      FUEL_RECEIVE_FILTER_STORAGE_KEY,
      JSON.stringify({
        search: '',
        siteFilter,
        quickRange,
        dateRange: serializedDateRange,
      }),
    )

    navigate('/fuel-receive', {
      state: {
        search: '',
        siteFilter,
        quickRange,
        dateRange: serializedDateRange,
      },
    })
  }

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
        <div
          style={{ cursor: loadingTrans ? 'default' : 'pointer' }}
          onClick={handleTransactionsClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleTransactionsClick()
            }
          }}
          role="button"
          tabIndex={loadingTrans ? -1 : 0}
        >
          <CWidgetStatsA
            color="primary"
            value={renderMetricValue(loadingTrans, `${totalTransactions} records`)}
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
        </div>
      </CCol>

      {/* FUEL RECEIVED */}
      <CCol sm={6} xl={4} xxl={3}>
        <div
          style={{ cursor: loadingReceive ? 'default' : 'pointer' }}
          onClick={handleFuelReceiveClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleFuelReceiveClick()
            }
          }}
          role="button"
          tabIndex={loadingReceive ? -1 : 0}
        >
          <CWidgetStatsA
            color="info"
            value={renderMetricValue(loadingReceive, `${totalFuelReceived} records`)}
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
        </div>
      </CCol>

      {/* FUEL STOCK */}
      <CCol sm={12} xl={4} xxl={6}>
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0 fw-semibold">Machine</h6>
                <Tooltip title="Data pada card ini adalah data saat ini sesuai filter site yang dipilih.">
                  <span
                    className="d-inline-flex align-items-center text-muted"
                    style={{ cursor: 'help' }}
                  >
                    <InfoCircleOutlined />
                  </span>
                </Tooltip>
              </div>
            </div>

            <div className="d-flex justify-content-around align-items-center text-center">
              <div>
                <div
                  className="fs-3 fw-bold text-success"
                  style={{ cursor: loadingStock ? 'default' : 'pointer' }}
                  onClick={() => handleStockStatusClick('online')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleStockStatusClick('online')
                    }
                  }}
                  role="button"
                  tabIndex={loadingStock ? -1 : 0}
                >
                  {loadingStock ? <CSpinner size="sm" color="success" /> : onlineStock}
                </div>
                <div className="text-success small fw-semibold">Online</div>
              </div>

              <div className="border-start" style={{ height: '45px' }} />

              <div>
                <div
                  className="fs-3 fw-bold text-secondary"
                  style={{ cursor: loadingStock ? 'default' : 'pointer' }}
                  onClick={() => handleStockStatusClick('standby')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleStockStatusClick('standby')
                    }
                  }}
                  role="button"
                  tabIndex={loadingStock ? -1 : 0}
                >
                  {loadingStock ? <CSpinner size="sm" color="secondary" /> : standbyStock}
                </div>
                <div className="text-muted small">Stand-by</div>
              </div>

              <div className="border-start" style={{ height: '45px' }} />

              <div>
                <div
                  className="fs-3 fw-bold text-danger"
                  style={{ cursor: loadingStock ? 'default' : 'pointer' }}
                  onClick={() => handleStockStatusClick('offline')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleStockStatusClick('offline')
                    }
                  }}
                  role="button"
                  tabIndex={loadingStock ? -1 : 0}
                >
                  {loadingStock ? <CSpinner size="sm" color="danger" /> : offlineStock}
                </div>
                <div className="text-danger small fw-semibold">Offline</div>
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
  siteFilter: PropTypes.string,
  dateRange: PropTypes.array,
  loadingTrans: PropTypes.bool,
  loadingReceive: PropTypes.bool,
  loadingStock: PropTypes.bool,
}

export default WidgetsDropdown
