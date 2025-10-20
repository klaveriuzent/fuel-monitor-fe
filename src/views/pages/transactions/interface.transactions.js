/* eslint-disable prettier/prettier */

export const transactionColumns = [
  { title: 'Site', dataIndex: 'id_site', key: 'id_site' },
  { title: 'Product', dataIndex: 'id_product', key: 'id_product' },
  { 
    title: 'Date', 
    dataIndex: 'waktu', 
    key: 'waktu',
    render: (text) => new Date(text).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },
  { title: 'Asset', dataIndex: 'id_nozzle', key: 'id_nozzle' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Volume (L)', dataIndex: 'volume', key: 'volume' },
  { title: 'Kilometer', dataIndex: 'odometer', key: 'odometer' },
  { title: 'Stock (L)', dataIndex: 'volume_minyak_atg', key: 'volume_minyak_atg' },
  { title: 'Action', key: 'action', width: 100 },
]