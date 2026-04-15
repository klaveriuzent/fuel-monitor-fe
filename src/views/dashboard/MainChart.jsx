import React, { useEffect, useMemo, useRef } from 'react'
import dayjs from 'dayjs'
import { CChartBar } from '@coreui/react-chartjs'
import { CSpinner } from '@coreui/react'
import { getStyle } from '@coreui/utils'

const getGranularity = (dateRange) => {
  const [start, end] = dateRange || []
  if (!start || !end) return 'month'

  const totalDays = Math.max(1, end.endOf('day').diff(start.startOf('day'), 'day') + 1)
  if (totalDays <= 1) return 'hour'
  if (totalDays <= 7) return 'day'
  if (totalDays <= 31) return 'week'
  return 'month'
}

const MainChart = ({ data = [], loading = false, dateRange = [null, null] }) => {
  const chartRef = useRef(null)

  const chartData = useMemo(() => {
    const [startRaw, endRaw] = dateRange || []
    const now = dayjs()
    const start = (startRaw ? dayjs(startRaw) : now.subtract(11, 'month')).startOf('day')
    const end = (endRaw ? dayjs(endRaw) : now).endOf('day')
    const granularity = getGranularity([start, end])

    const buckets = []
    const bucketMap = {}

    if (granularity === 'hour') {
      for (let hour = 0; hour < 24; hour += 1) {
        const point = start.startOf('day').add(hour, 'hour')
        const key = point.format('YYYY-MM-DD HH')
        buckets.push({ key, label: point.format('HH:00') })
        bucketMap[key] = { count: 0, volume: 0 }
      }
    } else if (granularity === 'day') {
      let cursor = start.startOf('day')
      const endDay = end.endOf('day')

      while (cursor.isBefore(endDay) || cursor.isSame(endDay, 'day')) {
        const key = cursor.format('YYYY-MM-DD')
        buckets.push({ key, label: cursor.format('DD MMM') })
        bucketMap[key] = { count: 0, volume: 0 }
        cursor = cursor.add(1, 'day')
      }
    } else if (granularity === 'week') {
      let cursor = start.startOf('week')
      const endWeek = end.endOf('week')

      while (cursor.isBefore(endWeek) || cursor.isSame(endWeek, 'week')) {
        const key = cursor.startOf('week').format('YYYY-MM-DD')
        const label = `${cursor.format('DD MMM')} - ${cursor.endOf('week').format('DD MMM')}`
        buckets.push({ key, label })
        bucketMap[key] = { count: 0, volume: 0 }
        cursor = cursor.add(1, 'week')
      }
    } else {
      let cursor = start.startOf('month')
      const endMonth = end.endOf('month')

      while (cursor.isBefore(endMonth) || cursor.isSame(endMonth, 'month')) {
        const key = cursor.format('YYYY-MM')
        buckets.push({ key, label: cursor.format('MMM YYYY') })
        bucketMap[key] = { count: 0, volume: 0 }
        cursor = cursor.add(1, 'month')
      }
    }

    data.forEach((item) => {
      const d = dayjs(item?.date)
      if (!d.isValid()) return
      if (d.isBefore(start) || d.isAfter(end)) return

      let key = ''
      if (granularity === 'hour') key = d.format('YYYY-MM-DD HH')
      else if (granularity === 'day') key = d.startOf('day').format('YYYY-MM-DD')
      else if (granularity === 'week') key = d.startOf('week').format('YYYY-MM-DD')
      else key = d.startOf('month').format('YYYY-MM')

      if (!bucketMap[key]) return
      bucketMap[key].count += 1
      bucketMap[key].volume += Number(item?.volume || 0)
    })

    const labels = buckets.map((bucket) => bucket.label)
    const countData = buckets.map((bucket) => bucketMap[bucket.key].count)
    const volumeData = buckets.map((bucket) => Number(bucketMap[bucket.key].volume.toFixed(2)))
    const maxCount = Math.max(...countData, 0)

    return { labels, countData, volumeData, maxCount, granularity }
  }, [data, dateRange])

  useEffect(() => {
    const handleColorSchemeChange = () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y1.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y1.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y1.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)
    return () =>
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
  }, [chartRef])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <CChartBar
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: chartData.labels,
          datasets: [
            {
              label: 'Jumlah Transaksi',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .75)`,
              borderColor: getStyle('--cui-info'),
              borderWidth: 1,
              data: chartData.countData,
              barPercentage: 0.7,
              categoryPercentage: 0.7,
              yAxisID: 'y',
            },
            {
              label: 'Total Volume (L)',
              type: 'line',
              data: chartData.volumeData,
              borderColor: getStyle('--cui-success'),
              backgroundColor: `rgba(${getStyle('--cui-success-rgb')}, .15)`,
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 4,
              yAxisID: 'y1',
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: getStyle('--cui-body-color'),
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const isVolume = ctx.dataset?.yAxisID === 'y1'
                  if (isVolume) {
                    return `${ctx.dataset.label}: ${Number(ctx.raw || 0).toLocaleString('id-ID')} L`
                  }
                  return `${ctx.dataset.label}: ${ctx.raw || 0} transaksi`
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
                autoSkip: chartData.granularity !== 'hour',
                maxRotation: 0,
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
              max: Math.max(5, Math.ceil(chartData.maxCount / 5) * 5),
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 5,
                stepSize: Math.max(1, Math.ceil(Math.max(5, chartData.maxCount) / 5)),
              },
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                drawOnChartArea: false,
                color: getStyle('--cui-border-color-translucent'),
              },
              ticks: {
                color: getStyle('--cui-body-color'),
                callback: (value) => `${Number(value).toLocaleString('id-ID')} L`,
              },
            },
          },
        }}
      />
    </>
  )
}

export default MainChart
