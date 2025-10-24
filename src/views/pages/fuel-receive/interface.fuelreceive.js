import { Tag } from 'antd'

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

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
