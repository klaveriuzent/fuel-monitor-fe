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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
  { title: 'ID Card', dataIndex: 'id_card', key: 'id_card', align: 'center' },
  { title: 'Username', dataIndex: 'username', key: 'username', align: 'center' },
  {
    title: 'License Plate',
    dataIndex: 'plat',
    key: 'plat',
    align: 'center',
    render: (value) => value || '-',
  },
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
    title: 'Stock By Receive',
    dataIndex: 'stock_by_receive',
    key: 'stock_by_receive',
    align: 'right',
    render: () => '-',
  },
  {
    title: 'Stock By ATG',
    dataIndex: 'stock_by_atg',
    key: 'stock_by_atg',
    align: 'right',
    render: () => '-',
  },
  {
    title: 'Unit Price (IDR)',
    dataIndex: 'unit_price',
    key: 'unit_price',
    align: 'right',
    sorter: (a, b) => Number(a.unit_price ?? 0) - Number(b.unit_price ?? 0),
    sortDirections: ['ascend', 'descend'],
    render: formatCurrency,
  },
]
