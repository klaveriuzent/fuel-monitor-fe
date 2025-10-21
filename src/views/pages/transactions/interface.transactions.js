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
    render: (value) => Number(value).toLocaleString('id-ID'),
  },
  {
    title: 'Volume (L)',
    dataIndex: 'volume',
    key: 'volume',
    render: formatDecimal,
  },
  {
    title: 'Unit Price (IDR)',
    dataIndex: 'unit_price',
    key: 'unit_price',
    render: formatCurrency,
  },
]
