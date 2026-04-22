import { CButton } from '@coreui/react'
import { CopyOutlined } from '@ant-design/icons'

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

  const datePart = date.toLocaleDateString('id-ID', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const timePart = date
    .toLocaleTimeString('id-ID', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    .replace(/\./g, ':')

  return (
    <>
      {datePart}
      <br />
      {timePart}
    </>
  )
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

export const formatLicensePlate = (value) => {
  if (value === null || value === undefined) return '-'
  const normalized = String(value).replace(/\s+/g, '').toUpperCase()
  return normalized || '-'
}

const formatValueOrDash = (value, formatter = (val) => val) =>
  value || value === 0 ? formatter(value) : '-'

const copyToClipboard = async (value) => {
  const text = String(value || '').trim()
  if (!text) return

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
  }
}

const renderEmphasizedDecimal = (value) => {
  if (value === null || value === undefined || value === '') return '-'

  const formatted = formatDecimal(value)
  const [integerPart, decimalPart = '00'] = formatted.split(',')

  return (
    <span className="fuel-receive-total__number">
      <span className="fuel-receive-total__integer">{integerPart}</span>
      <span className="fuel-receive-total__decimal">,{decimalPart}</span>
    </span>
  )
}

export const buildFuelReceiveColumns = (onEdit = () => {}, onOpenAttachment = () => {}) => [
  { title: 'Site', dataIndex: 'id_site', key: 'id_site' },
  { title: 'Tank', dataIndex: 'id_tank', key: 'id_tank', align: 'center' },
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
      <div className="fuel-receive-doc-stack p-2">
        <div className="fuel-receive-doc__card">
          <div className="fuel-receive-doc__row">
            <span className="fuel-receive-doc__label">No. PO</span>
            <span className="fuel-receive-doc__value">
              {record?.no_invoice ?? '-'}
              <button
                type="button"
                className="fuel-receive-doc__copy-btn"
                onClick={() => {
                  void copyToClipboard(record?.no_invoice)
                }}
                title="Copy No. PO"
                aria-label="Copy No. PO"
              >
                <CopyOutlined />
              </button>
            </span>
          </div>
          <div className="fuel-receive-doc__row">
            <span className="fuel-receive-doc__label">No. DO</span>
            <span className="fuel-receive-doc__value">
              {record?.no_do ?? '-'}
              <button
                type="button"
                className="fuel-receive-doc__copy-btn"
                onClick={() => {
                  void copyToClipboard(record?.no_do)
                }}
                title="Copy No. DO"
                aria-label="Copy No. DO"
              >
                <CopyOutlined />
              </button>
            </span>
          </div>
        </div>
        <div className="fuel-receive-request">
          <div className="fuel-receive-request__card">
            <div className="fuel-receive-request__row">
              <div className="fuel-receive-request__title">Volume Permintaan (L)</div>
              <div className="fuel-receive-request__value">
                {renderEmphasizedDecimal(record?.volume_permintaan)}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Pengiriman',
    key: 'pengiriman',
    render: (_, record) => (
      <div className="fuel-receive-shipping-stack p-2">
        <div className="fuel-receive-shipping__card">
          <div className="fuel-receive-shipping__row fuel-receive-shipping__row--sender">
            <span className="fuel-receive-shipping__sender-text">{record?.pengirim ?? '-'}</span>
            <button
              type="button"
              className="fuel-receive-doc__copy-btn"
              onClick={() => {
                void copyToClipboard(record?.pengirim)
              }}
              title="Copy Sender"
              aria-label="Copy Sender"
            >
              <CopyOutlined />
            </button>
          </div>
          <div className="fuel-receive-shipping__row">
            <span className="fuel-receive-shipping__label">License Plate</span>
            <span className="fuel-receive-shipping__value">
              {formatLicensePlate(record?.no_kendaraan)}
              <button
                type="button"
                className="fuel-receive-doc__copy-btn"
                onClick={() => {
                  void copyToClipboard(formatLicensePlate(record?.no_kendaraan))
                }}
                title="Copy License Plate"
                aria-label="Copy License Plate"
              >
                <CopyOutlined />
              </button>
            </span>
          </div>
          <div className="fuel-receive-shipping__row">
            <span className="fuel-receive-shipping__label">Driver</span>
            <span className="fuel-receive-shipping__value">
              {record?.nama_pengemudi ?? '-'}
              <button
                type="button"
                className="fuel-receive-doc__copy-btn"
                onClick={() => {
                  void copyToClipboard(record?.nama_pengemudi)
                }}
                title="Copy Driver"
                aria-label="Copy Driver"
              >
                <CopyOutlined />
              </button>
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Total',
    key: 'total_information',
    align: 'right',
    render: (_, record) => (
      <div className="fuel-receive-total-stack p-2">
        <div className="fuel-receive-total__card">
          <div className="fuel-receive-total__row">
            <span className="fuel-receive-total__label">Total Delivery (L)</span>
            <span className="fuel-receive-total__value">
              {renderEmphasizedDecimal(record?.total_deliv)}
              <button
                type="button"
                className="fuel-receive-doc__copy-btn"
                onClick={() => {
                  void copyToClipboard(formatDecimal(record?.total_deliv ?? 0))
                }}
                title="Copy Total Delivery"
                aria-label="Copy Total Delivery"
              >
                <CopyOutlined />
              </button>
            </span>
            <span className="fuel-receive-total__percent" />
          </div>
          <div className="fuel-receive-total__row">
            <span className="fuel-receive-total__label">Total Permintaan (L)</span>
            <span className="fuel-receive-total__value">
              {renderEmphasizedDecimal(record?.total_permintaan)}
              <button
                type="button"
                className="fuel-receive-doc__copy-btn"
                onClick={() => {
                  void copyToClipboard(formatDecimal(record?.total_permintaan ?? 0))
                }}
                title="Copy Total Permintaan"
                aria-label="Copy Total Permintaan"
              >
                <CopyOutlined />
              </button>
            </span>
            <span className="fuel-receive-total__percent" />
          </div>
          <div className="fuel-receive-total__row">
            <span className="fuel-receive-total__label">Total Selisih (L)</span>
            <span className="fuel-receive-total__value">
              {renderEmphasizedDecimal(record?.total_selisih)}
              <button
                type="button"
                className="fuel-receive-doc__copy-btn"
                onClick={() => {
                  void copyToClipboard(formatDecimal(record?.total_selisih ?? 0))
                }}
                title="Copy Total Selisih"
                aria-label="Copy Total Selisih"
              >
                <CopyOutlined />
              </button>
            </span>
            <small
              className="fuel-receive-total__percent"
              style={{
                color:
                  Number(record?.persentase_selisih || 0) < 0
                    ? 'var(--cui-danger, #dc3545)'
                    : 'var(--cui-success, #198754)',
              }}
            >
              ({formatValueOrDash(record?.persentase_selisih, formatPercentage)})
              <button
                type="button"
                className="fuel-receive-doc__copy-btn"
                onClick={() => {
                  void copyToClipboard(formatPercentage(record?.persentase_selisih ?? 0))
                }}
                title="Copy Persentase Selisih"
                aria-label="Copy Persentase Selisih"
              >
                <CopyOutlined />
              </button>
            </small>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Attachment',
    key: 'attachment',
    width: 120,
    align: 'center',
    render: (_, record) => (
      <CButton
        color="secondary"
        size="sm"
        variant="outline"
        onClick={() => onOpenAttachment(record)}
      >
        Upload
      </CButton>
    ),
  },
  // SAAT INI TIDAK ADA ACTION, JADI SAYA KOMEN AJA DULU, NANTI BISA DITAMBAHKAN KEMBALI
  // {
  //   title: 'Action',
  //   key: 'action',
  //   width: 110,
  //   fixed: 'right',
  //   render: (_, record) => (
  //     <CButton color="info" size="sm" className="text-white" onClick={() => onEdit(record)}>
  //       Edit
  //     </CButton>
  //   ),
  // },
]
