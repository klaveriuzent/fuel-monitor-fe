import { CButton } from '@coreui/react'
import { Tag } from 'antd'

export const parseDateSafe = (value) => {
  if (!value) return null

  // sudah Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  const str = String(value).trim()

  // 1️⃣ ISO (2025-12-26T00:00:00Z)
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  }

  // 2️⃣ SQL datetime string (2025-12-30 00:00:00.000)
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(\.\d{3})?$/.test(str)) {
    const d = new Date(str.replace(' ', 'T') + 'Z')
    return isNaN(d.getTime()) ? null : d
  }

  // 3️⃣ Date saja (2025-12-30)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(`${str}T00:00:00Z`)
    return isNaN(d.getTime()) ? null : d
  }

  // 4️⃣ "Dec 26 2025 12:00AM"
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

    if (ap === 'AM') {
      if (hour === 12) hour = 0
    } else {
      if (hour !== 12) hour += 12
    }

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

export const buildFuelReceiveColumns = (onEdit = () => {}) => [
  { title: 'Site', dataIndex: 'id_site', key: 'id_site' },
  { title: 'Tank', dataIndex: 'id_tank', key: 'id_tank' },
  {
    title: 'Date',
    dataIndex: 'waktu_mulai_delivery',
    key: 'waktu_mulai_delivery',
    sorter: (a, b) => {
      const timeA = parseDateSafe(a?.waktu_mulai_delivery)?.getTime() ?? 0
      const timeB = parseDateSafe(b?.waktu_mulai_delivery)?.getTime() ?? 0
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
  {
    title: 'Action',
    key: 'action',
    width: 110,
    fixed: 'right',
    render: (_, record) => (
      <CButton
        color="info"
        size="sm"
        className="text-white"
        onClick={() => onEdit(record)}
      >
        Edit
      </CButton>
    ),
  },
]
