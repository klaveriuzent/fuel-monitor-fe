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

export const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value))

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
  { title: 'ID Card', dataIndex: 'id_card', key: 'id_card' },
  { title: 'Username', dataIndex: 'username', key: 'username' },
  {
    title: 'License Plate',
    dataIndex: 'plat',
    key: 'plat',
    render: (value) => value || '-',
  },
  {
    title: 'Odometer',
    dataIndex: 'odometer',
    key: 'odometer',
    sorter: (a, b) => Number(a.odometer ?? 0) - Number(b.odometer ?? 0),
    sortDirections: ['ascend', 'descend'],
    render: (value) => Number(value).toLocaleString('id-ID'),
  },
  {
    title: 'Volume (L)',
    dataIndex: 'volume',
    key: 'volume',
    sorter: (a, b) => Number(a.volume ?? 0) - Number(b.volume ?? 0),
    sortDirections: ['ascend', 'descend'],
    render: formatDecimal,
  },
  {
    title: 'Unit Price (IDR)',
    dataIndex: 'unit_price',
    key: 'unit_price',
    sorter: (a, b) => Number(a.unit_price ?? 0) - Number(b.unit_price ?? 0),
    sortDirections: ['ascend', 'descend'],
    render: formatCurrency,
  },
]
