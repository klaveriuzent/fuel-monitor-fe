import React, { useEffect, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { CButton, CButtonGroup, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'
import Chart from 'chart.js/auto'
import { getStyle } from '@coreui/utils'
import { formatTooltipLabel, formatXAxisLabel } from './fuelCardUtils'

const FuelCardModalChart = ({
  item,
  isModalVisible,
  setIsModalVisible,
  timeScale,
  setTimeScale,
  labels,
  fuelData,
  waterData,
  totalData,
  offlineMask,
  offlineRanges,
  isLoading,
  errorMessage,
  isStandby,
  capacity,
}) => {
  const chartCanvasRef = useRef(null)
  const chartInstanceRef = useRef(null)

  const yAxisMax = useMemo(() => {
    const values = [...fuelData, ...waterData, ...totalData]
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v))
    if (capacity > 0) values.push(capacity)
    const peak = values.length ? Math.max(...values) : 0
    if (peak <= 0) return undefined
    return Math.ceil(peak * 1.1)
  }, [capacity, fuelData, totalData, waterData])

  const visibleFuelData = useMemo(
    () =>
      timeScale === 'day' ? fuelData.map((v, idx) => (offlineMask[idx] ? null : v)) : fuelData,
    [fuelData, offlineMask, timeScale],
  )

  const visibleWaterData = useMemo(
    () =>
      timeScale === 'day' ? waterData.map((v, idx) => (offlineMask[idx] ? null : v)) : waterData,
    [offlineMask, timeScale, waterData],
  )

  const visibleTotalData = useMemo(
    () =>
      timeScale === 'day' ? totalData.map((v, idx) => (offlineMask[idx] ? null : v)) : totalData,
    [offlineMask, timeScale, totalData],
  )

  const lastValidLabel = useMemo(() => {
    for (let i = labels.length - 1; i >= 0; i -= 1) {
      const isOfflinePoint = Boolean(offlineMask[i])
      if (isOfflinePoint) continue
      if (
        visibleFuelData[i] !== null ||
        visibleWaterData[i] !== null ||
        visibleTotalData[i] !== null
      ) {
        return labels[i]
      }
    }
    return null
  }, [labels, offlineMask, visibleFuelData, visibleTotalData, visibleWaterData])

  const lastTelemetryLabel =
    lastValidLabel || item.update_date
      ? formatTooltipLabel(lastValidLabel || item.update_date, 'day')
      : '-'

  const offlineBackgroundPlugin = useMemo(
    () => ({
      id: `offline-background-${item.id_site}-${item.id_tank}`,
      beforeDatasetsDraw: (chart) => {
        if (timeScale !== 'day' || !offlineRanges.length) return

        const xScale = chart?.scales?.x
        const chartArea = chart?.chartArea
        const totalPoints = chart?.data?.labels?.length ?? 0
        if (!xScale || !chartArea || totalPoints < 1) return

        const ctx = chart.ctx
        const dangerRgb = getStyle('--cui-danger-rgb') || '220,53,69'
        ctx.save()
        ctx.fillStyle = `rgba(${dangerRgb}, 0.16)`
        ctx.strokeStyle = `rgba(${dangerRgb}, 0.35)`
        ctx.lineWidth = 1
        ctx.setLineDash([5, 3])

        offlineRanges.forEach((range) => {
          if (range.start < 0 || range.end < range.start) return

          const startCenter = xScale.getPixelForValue(range.start)
          const endCenter = xScale.getPixelForValue(range.end)
          let left = startCenter
          let right = endCenter

          if (range.start > 0) {
            const prevCenter = xScale.getPixelForValue(range.start - 1)
            left = (prevCenter + startCenter) / 2
          } else {
            left = chartArea.left
          }

          if (range.end < totalPoints - 1) {
            const nextCenter = xScale.getPixelForValue(range.end + 1)
            right = (endCenter + nextCenter) / 2
          } else {
            right = chartArea.right
          }

          const width = Math.max(0, right - left)
          const height = chartArea.bottom - chartArea.top
          ctx.fillRect(left, chartArea.top, width, height)
          ctx.beginPath()
          ctx.moveTo(left, chartArea.top)
          ctx.lineTo(left, chartArea.bottom)
          ctx.moveTo(right, chartArea.top)
          ctx.lineTo(right, chartArea.bottom)
          ctx.stroke()

          if (width > 36) {
            ctx.save()
            ctx.setLineDash([])
            ctx.fillStyle = `rgba(${dangerRgb}, 0.95)`
            ctx.font = '600 10px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('OFFLINE', left + width / 2, chartArea.top + 12)
            ctx.restore()
          }
        })

        ctx.restore()
      },
    }),
    [item.id_site, item.id_tank, offlineRanges, timeScale],
  )

  useEffect(() => {
    if (!isModalVisible || isLoading || errorMessage) return undefined
    if (!chartCanvasRef.current) return undefined

    const ctx = chartCanvasRef.current.getContext('2d')
    if (!ctx) return undefined

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
      chartInstanceRef.current = null
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Fuel',
            backgroundColor: `rgba(${getStyle('--cui-warning-rgb')}, .1)`,
            borderColor: getStyle('--cui-warning'),
            pointHoverBackgroundColor: getStyle('--cui-warning'),
            borderWidth: 2,
            data: visibleFuelData,
            fill: true,
            spanGaps: false,
          },
          {
            label: 'Water',
            backgroundColor: 'transparent',
            borderColor: getStyle('--cui-info'),
            pointHoverBackgroundColor: getStyle('--cui-info'),
            borderWidth: 2,
            data: visibleWaterData,
            spanGaps: false,
          },
          {
            label: 'Total',
            backgroundColor: 'transparent',
            borderColor: getStyle('--cui-success'),
            pointHoverBackgroundColor: getStyle('--cui-success'),
            borderWidth: 2,
            borderDash: [6, 4],
            data: visibleTotalData,
            spanGaps: false,
          },
          {
            label: 'Tank Capacity',
            backgroundColor: 'transparent',
            borderColor: getStyle('--cui-danger'),
            pointHoverBackgroundColor: getStyle('--cui-danger'),
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            data: labels.map(() => capacity),
            spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
                const isOfflineAtPoint =
                  timeScale === 'day' && Boolean(offlineMask[context.dataIndex])
                if (isOfflineAtPoint) {
                  return `${context.dataset.label}: Offline / No data`
                }

                const rawValue = context.raw
                const parsedValue = context.parsed?.y
                const isMissingValue =
                  rawValue === null ||
                  rawValue === undefined ||
                  parsedValue === null ||
                  parsedValue === undefined ||
                  Number.isNaN(Number(parsedValue))
                if (isMissingValue) {
                  return `${context.dataset.label}: No data`
                }

                const v = Number(parsedValue)
                return `${context.dataset.label}: ${v.toLocaleString('id-ID', {
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
            max: yAxisMax,
            ticks: {
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
      },
      plugins: [offlineBackgroundPlugin],
    })

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
  }, [
    capacity,
    errorMessage,
    isLoading,
    isModalVisible,
    labels,
    offlineBackgroundPlugin,
    offlineMask,
    timeScale,
    visibleFuelData,
    visibleTotalData,
    visibleWaterData,
    yAxisMax,
  ])

  return (
    <CModal
      alignment="center"
      size="lg"
      visible={isModalVisible}
      onClose={() => setIsModalVisible(false)}
    >
      <CModalHeader>
        <CModalTitle>
          Fuel Tank {item.id_tank} - {item.id_site}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="fuel-card-modal__timescale mb-3">
          <strong className="fuel-card-modal__timescale-label">Time Scale:</strong>
          <CButtonGroup
            role="radiogroup"
            aria-label={`Time scale for fuel tank ${item.id_tank}`}
            className="fuel-card-modal__timescale-group"
          >
            {[
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
            ].map((option) => {
              const isActive = timeScale === option.value
              return (
                <CButton
                  key={option.value}
                  type="button"
                  size="sm"
                  color={isActive ? 'primary' : 'secondary'}
                  variant={isActive ? undefined : 'outline'}
                  className={`fuel-card-modal__timescale-btn${
                    isActive ? ' fuel-card-modal__timescale-btn--active' : ''
                  }`}
                  aria-pressed={isActive}
                  onClick={() => setTimeScale(option.value)}
                >
                  {option.label}
                </CButton>
              )
            })}
          </CButtonGroup>
        </div>

        {isLoading && <div className="mb-2">Loading chart...</div>}
        {errorMessage && <div className="mb-2 text-danger">{errorMessage}</div>}
        {!isLoading && !errorMessage && isStandby && (
          <div className="mb-2 text-warning small">Last telemetry at: {lastTelemetryLabel}</div>
        )}
        {!isLoading && !errorMessage && timeScale === 'day' && offlineRanges.length > 0 && (
          <div className="mb-2 text-muted small d-flex align-items-center gap-2">
            <span
              style={{
                display: 'inline-block',
                width: '14px',
                height: '10px',
                background: 'rgba(220, 53, 69, 0.16)',
                border: '1px dashed rgba(220, 53, 69, 0.5)',
              }}
            />
            Offline zone (telemetry tidak tersedia)
          </div>
        )}
        {!isLoading &&
          !errorMessage &&
          timeScale === 'day' &&
          String(item.aktif_flag ?? '') !== '1' && (
            <div className="mb-2 text-warning small">
              Telemetry saat ini tidak tersedia. Last valid data:{' '}
              {lastValidLabel ? formatTooltipLabel(lastValidLabel, 'day') : '-'}
            </div>
          )}

        <div style={{ height: '260px' }}>
          <canvas ref={chartCanvasRef} />
        </div>
      </CModalBody>
    </CModal>
  )
}

FuelCardModalChart.propTypes = {
  item: PropTypes.shape({
    id_tank: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    id_site: PropTypes.string.isRequired,
    update_date: PropTypes.string,
    aktif_flag: PropTypes.string.isRequired,
  }).isRequired,
  isModalVisible: PropTypes.bool.isRequired,
  setIsModalVisible: PropTypes.func.isRequired,
  timeScale: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  setTimeScale: PropTypes.func.isRequired,
  labels: PropTypes.arrayOf(PropTypes.any).isRequired,
  fuelData: PropTypes.arrayOf(PropTypes.any).isRequired,
  waterData: PropTypes.arrayOf(PropTypes.any).isRequired,
  totalData: PropTypes.arrayOf(PropTypes.any).isRequired,
  offlineMask: PropTypes.arrayOf(PropTypes.bool).isRequired,
  offlineRanges: PropTypes.arrayOf(
    PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  isStandby: PropTypes.bool.isRequired,
  capacity: PropTypes.number.isRequired,
}

export default FuelCardModalChart
