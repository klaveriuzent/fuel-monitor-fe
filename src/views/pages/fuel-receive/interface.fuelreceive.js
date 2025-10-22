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
    render: formatDateTime,
  },
  {
    title: 'Document',
    key: 'document',
    render: (_, record) => (
      <div className="d-flex flex-column">
        <span>No. Invoice: {record?.no_invoice ?? '-'}</span>
        <span>No. DO: {record?.no_do ?? '-'}</span>
      </div>
    ),
  },
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
    title: 'Total',
    key: 'total_information',
    render: (_, record) => (
      <div className="d-flex flex-column">
        <span>
          Total Delivery (L): {formatValueOrDash(record?.total_deliv, formatDecimal)}
        </span>
        <span>
          Total Permintaan (L): {formatValueOrDash(record?.total_permintaan, formatDecimal)}
        </span>
        <span>
          Total Selisih (L): {formatValueOrDash(record?.total_selisih, formatDecimal)}
        </span>
        <span>
          Persentase Selisih:{' '}
          {formatValueOrDash(record?.persentase_selisih, formatPercentage)}
        </span>
      </div>
    ),
  },
]
