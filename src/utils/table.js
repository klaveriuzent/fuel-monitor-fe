export const getColumnKey = (column) => {
  if (!column) return null
  if (column.key) return column.key
  if (Array.isArray(column.dataIndex)) {
    return column.dataIndex.filter(Boolean).join('.')
  }
  return column.dataIndex || null
}
