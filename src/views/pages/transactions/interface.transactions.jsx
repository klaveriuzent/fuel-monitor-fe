import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

export const formatDateTime = (value) =>
  new Date(value)
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

export const formatDecimal = (value) =>
  Number(value).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const formatCurrency = (value) => {
  const safeValue = Number(value)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(safeValue) ? 0 : safeValue)
}

export const transactionColumns = [
  { title: 'Site', dataIndex: 'id_site', key: 'id_site' },
  {
    title: 'Date',
    dataIndex: 'waktu',
    key: 'waktu',
    sorter: (a, b) => {
      const timeA = a?.waktu ? new Date(a.waktu).getTime() : 0
      const timeB = b?.waktu ? new Date(b.waktu).getTime() : 0
      return timeA - timeB
    },
    sortDirections: ['ascend', 'descend'],
    render: formatDateTime,
  },
  { title: 'No. Unit', dataIndex: 'id_card', key: 'id_card', align: 'right' },
  { title: 'Username', dataIndex: 'username', key: 'username', align: 'center' },
  {
    title: 'Odometer',
    dataIndex: 'odometer',
    key: 'odometer',
    align: 'right',
    sorter: (a, b) => Number(a.odometer ?? 0) - Number(b.odometer ?? 0),
    sortDirections: ['ascend', 'descend'],
    render: (value) => Number(value).toLocaleString('id-ID'),
  },
  {
    title: 'Volume (L)',
    dataIndex: 'volume',
    key: 'volume',
    align: 'right',
    sorter: (a, b) => Number(a.volume ?? 0) - Number(b.volume ?? 0),
    sortDirections: ['ascend', 'descend'],
    render: formatDecimal,
  },
  {
    title: (
      <span className="d-inline-flex align-items-center gap-1">
        <span>Stock By Receive</span>
        <Tooltip title="Stock hasil perhitungan berdasarkan data fuel receive.">
          <span className="d-inline-flex align-items-center text-muted" style={{ cursor: 'help' }}>
            <InfoCircleOutlined />
          </span>
        </Tooltip>
      </span>
    ),
    dataIndex: 'stock_by_receive',
    key: 'stock_by_receive',
    align: 'right',
    render: () => '-',
  },
  {
    title: (
      <span className="d-inline-flex align-items-center gap-1">
        <span>Stock By ATG</span>
        <Tooltip title="Stock hasil pembacaan langsung dari tiap mesin ATG dalam satu Site. Nilai ini bisa tidak konsisten karena dipengaruhi oleh faktor eksternal seperti ketersediaan jaringan dan status mesin aktif, sehingga tidak digunakan untuk perhitungan lebih lanjut.">
          <span className="d-inline-flex align-items-center text-muted" style={{ cursor: 'help' }}>
            <InfoCircleOutlined />
          </span>
        </Tooltip>
      </span>
    ),
    dataIndex: 'stock_by_atg',
    key: 'stock_by_atg',
    align: 'right',
    render: (value) => (value === null || value === undefined || value === '' ? '-' : value),
  },
  {
    title: 'Unit Price',
    dataIndex: 'unit_price',
    key: 'unit_price',
    align: 'right',
    sorter: (a, b) => Number(a.unit_price ?? 0) - Number(b.unit_price ?? 0),
    sortDirections: ['ascend', 'descend'],
    render: formatCurrency,
  },
]
