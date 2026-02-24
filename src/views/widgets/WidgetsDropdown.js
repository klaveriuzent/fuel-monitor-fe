import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import { CRow, CCol, CWidgetStatsA } from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'

const WidgetsDropdown = ({
  className,
  fuelReceiveData = [],
  transaksiData = [],
  stockData = [],
}) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const widgetChartRef3 = useRef(null)

  /* ─── hitung total ─────────────────────────────────────── */
  const totalTransactions = transaksiData.length
  const totalFuelReceived = fuelReceiveData.length

  const onlineStock = stockData.filter((s) => s.status?.toLowerCase() === 'online').length
  const standbyStock = stockData.filter((s) =>
    ['standby', 'offline'].includes((s.status || '').toLowerCase()),
  ).length

  /* ─── color-scheme listener ─────────────────────────────── */
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

      {/* FUEL STOCK (online & standby) */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning"
          title="Fuel Stock"
          value={
            <>
              <span className="fw-bold">{onlineStock}</span>
              <span className="small ms-1">online</span>
              <br />
              <span className="fw-bold">{standbyStock}</span>
              <span className="small ms-1">standby</span>
            </>
          }
          /* dummy chart agar tinggi konsisten */
          chart={<div style={{ height: '51.79px' }} />}
        />
      </CCol>

      {/* TANK EMPTY SPACE (dummy) */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="danger"
          value="..."
          title="Tank Empty Space"
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: Array.from({ length: 16 }, (_, i) => `M${i + 1}`),
                datasets: [
                  {
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { display: false } },
                  y: { display: false },
                },
              }}
            />
          }
        />
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
