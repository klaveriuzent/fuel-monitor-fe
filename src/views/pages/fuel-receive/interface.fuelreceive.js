import { Tag } from 'antd'

const parseDateSafe = (value) => {
  if (!value) return null

  // kalau sudah Date object
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value

  const str = String(value).trim()

  // ISO (2025-12-26T00:00:00Z)
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  }

  // "Dec 26 2025 12:00AM"
  // format: MMM DD YYYY hh:mmAM/PM (tanpa spasi sebelum AM/PM)
  const m = str.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})(AM|PM)$/i)
  if (m) {
    const [, monStr, dayStr, yearStr, hourStr, minStr, apRaw] = m
    const months = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    }

    const mon = months[monStr.toLowerCase()]
    if (mon === undefined) return null

    let hour = Number(hourStr)
    const minute = Number(minStr)
    const day = Number(dayStr)
    const year = Number(yearStr)
    const ap = apRaw.toUpperCase()

    // konversi 12 jam → 24 jam
    if (ap === 'AM') {
      if (hour === 12) hour = 0
    } else {
      if (hour !== 12) hour += 12
    }

    // Anggap input ini UTC biar konsisten dengan formatter kamu (timeZone: 'UTC')
    const d = new Date(Date.UTC(year, mon, day, hour, minute, 0))
    return isNaN(d.getTime()) ? null : d
  }

  return null
}

export const formatDateTime = (value) => {
  const date = parseDateSafe(value)
  if (!date) return '-'

  return date
    .toLocaleString('id-ID', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    .replace(/\./g, ':')
}

export const formatDecimal = (value) =>
  Number(value).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const formatPercentage = (value) =>
  `${Number(value).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`

const formatValueOrDash = (value, formatter = (val) => val) =>
  value || value === 0 ? formatter(value) : '-'

export const fuelReceiveColumns = [
  { title: 'Site', dataIndex: 'id_site', key: 'id_site' },
  {
    title: 'Date',
    dataIndex: 'waktu_mulai_delivery',
    key: 'waktu_mulai_delivery',
    sorter: (a, b) => {
      const timeA = a?.waktu_mulai_delivery ? new Date(a.waktu_mulai_delivery).getTime() : 0
      const timeB = b?.waktu_mulai_delivery ? new Date(b.waktu_mulai_delivery).getTime() : 0
      return timeA - timeB
    },
    sortDirections: ['ascend', 'descend'],
    render: formatDateTime,
  },
  {
    title: 'Document',
    key: 'document',
    render: (_, record) => (
      <div className="d-flex flex-column gap-2 p-2">
        <span>
          <Tag style={{ fontSize: '13px', fontWeight: 500 }}>No. Invoice</Tag>{' '}
          <span style={{ fontSize: '12px', color: '#555' }}>{record?.no_invoice ?? '-'}</span>
        </span>
        <span>
          <Tag style={{ fontSize: '13px', fontWeight: 500 }}>No. DO</Tag>{' '}
          <span style={{ fontSize: '12px', color: '#555' }}>{record?.no_do ?? '-'}</span>
        </span>
        <span>
          <Tag style={{ fontSize: '13px', fontWeight: 500 }}>Volume Permintaan (L)</Tag>{' '}
          <span style={{ fontSize: '12px', color: '#555' }}>
            {formatValueOrDash(record?.volume_permintaan, formatDecimal)}
          </span>
        </span>
      </div>
    ),
  },
  {
    title: 'Pengiriman',
    key: 'pengiriman',
    render: (_, record) => (
      <div className="d-flex flex-column gap-2 p-2">
        <span>
          <strong>{record?.pengirim ?? '-'}</strong>
        </span>
        <span>
          <Tag style={{ fontSize: '13px', fontWeight: 500 }}>License Plate</Tag>{' '}
          <span style={{ fontSize: '12px', color: '#555' }}>{record?.no_kendaraan ?? '-'}</span>
        </span>
        <span>
          <Tag style={{ fontSize: '13px', fontWeight: 500 }}>Driver</Tag>{' '}
          <span style={{ fontSize: '12px', color: '#555' }}>{record?.nama_pengemudi ?? '-'}</span>
        </span>
      </div>
    ),
  },
  {
    title: 'Total',
    key: 'total_information',
    render: (_, record) => (
      <div className="d-flex flex-column gap-2 p-2">
        <span>
          <Tag style={{ fontSize: '13px', fontWeight: 500 }}>Total Delivery (L)</Tag>{' '}
          <span style={{ fontSize: '12px', color: '#555' }}>
            {formatValueOrDash(record?.total_deliv, formatDecimal)}
          </span>
        </span>
        <span>
          <Tag style={{ fontSize: '13px', fontWeight: 500 }}>Total Permintaan (L)</Tag>{' '}
          <span style={{ fontSize: '12px', color: '#555' }}>
            {formatValueOrDash(record?.total_permintaan, formatDecimal)}
          </span>
        </span>
        <span>
          <Tag style={{ fontSize: '13px', fontWeight: 500 }}>Total Selisih (L)</Tag>{' '}
          <span style={{ fontSize: '12px', color: '#555' }}>
            {formatValueOrDash(record?.total_selisih, formatDecimal)}{' '}
            <small style={{ color: '#777' }}>
              ({formatValueOrDash(record?.persentase_selisih, formatPercentage)})
            </small>
          </span>
        </span>
      </div>
    ),
  },
]
