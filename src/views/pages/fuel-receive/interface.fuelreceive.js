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

export const fuelReceiveColumns = [
  { title: 'Site', dataIndex: 'id_site', key: 'id_site' },
  {
    title: 'Date',
    dataIndex: 'waktu_mulai_delivery',
    key: 'waktu_mulai_delivery',
    render: formatDateTime,
  },
  { title: 'No. Invoice', dataIndex: 'no_invoice', key: 'no_invoice' },
  { title: 'No. DO', dataIndex: 'no_do', key: 'no_do' },
  {
    title: 'Volume Permintaan (L)',
    dataIndex: 'volume_permintaan',
    key: 'volume_permintaan',
    render: formatDecimal,
  },
  { title: 'License Plate', dataIndex: 'no_kendaraan', key: 'no_kendaraan' },
  { title: 'Pengirim', dataIndex: 'pengirim', key: 'pengirim' },
  { title: 'Driver', dataIndex: 'nama_pengemudi', key: 'nama_pengemudi' },
  {
    title: 'Total Delivery (L)',
    dataIndex: 'total_deliv',
    key: 'total_deliv',
    render: formatDecimal,
  },
  {
    title: 'Total Permintaan (L)',
    dataIndex: 'total_permintaan',
    key: 'total_permintaan',
    render: formatDecimal,
  },
  {
    title: 'Total Selisih (L)',
    dataIndex: 'total_selisih',
    key: 'total_selisih',
    render: formatDecimal,
  },
  {
    title: 'Persentase Selisih',
    dataIndex: 'persentase_selisih',
    key: 'persentase_selisih',
    render: formatPercentage,
  },
]
