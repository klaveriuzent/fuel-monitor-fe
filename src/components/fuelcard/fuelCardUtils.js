export const toNumber = (v) => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export const toNullableNumber = (v) => {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export const getTanggalSortValue = (tanggal, scale) => {
  if (!tanggal) return null

  const parsed = new Date(tanggal)
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime()

  const raw = String(tanggal).trim()
  const parsedIsoLike = new Date(raw.replace(' ', 'T'))
  if (!Number.isNaN(parsedIsoLike.getTime())) return parsedIsoLike.getTime()

  if (scale === 'month') {
    const monthMatch = raw.match(/^(\d{4})-(\d{2})$/)
    if (monthMatch) {
      const [, y, m] = monthMatch
      return Date.UTC(Number(y), Number(m) - 1, 1)
    }
  }

  if (scale === 'week') {
    const weekMatch = raw.match(/^(\d{4})-W(\d{1,2})$/i)
    if (weekMatch) {
      const [, y, w] = weekMatch
      return Date.UTC(Number(y), 0, 1 + (Number(w) - 1) * 7)
    }
  }

  return null
}

export const parseTanggalByScale = (dateValue, scale) => {
  if (!dateValue) return null
  const parsed = new Date(dateValue)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const raw = String(dateValue).trim()
  const parsedIsoLike = new Date(raw.replace(' ', 'T'))
  if (!Number.isNaN(parsedIsoLike.getTime())) return parsedIsoLike

  if (scale === 'month') {
    const monthMatch = raw.match(/^(\d{4})-(\d{2})$/)
    if (monthMatch) {
      const [, y, m] = monthMatch
      return new Date(Number(y), Number(m) - 1, 1)
    }
  }

  if (scale === 'week') {
    const weekMatch = raw.match(/^(\d{4})-W(\d{1,2})$/i)
    if (weekMatch) {
      const [, y, w] = weekMatch
      return new Date(Number(y), 0, 1 + (Number(w) - 1) * 7)
    }
  }

  return null
}

export const formatTooltipLabel = (dateValue, scale) => {
  if (!dateValue) return ''
  const parsedDate = new Date(dateValue)
  const isValidDate = !Number.isNaN(parsedDate.getTime())

  if (!isValidDate) {
    return String(dateValue)
  }

  if (scale === 'day') {
    return parsedDate.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
  }

  return parsedDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export const formatXAxisLabel = (dateValue, scale) => {
  if (!dateValue) return ''
  const parsedDate = parseTanggalByScale(dateValue, scale)
  if (!parsedDate) return String(dateValue)

  if (scale === 'week' || scale === 'month') {
    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  }

  const monthDay = parsedDate.toLocaleDateString('id-ID', {
    month: 'short',
    day: '2-digit',
  })
  const hourMinute = parsedDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  return `${monthDay} ${hourMinute}`
}

export const isHistoryRowOffline = (row) => {
  const flag = String(row?.aktif_flag ?? '').trim()
  if (flag === '0') return true

  const oil = toNullableNumber(row?.volume_oil)
  const water = toNullableNumber(row?.volume_air)
  return oil === null && water === null
}

export const getOfflineRanges = (mask) => {
  const ranges = []
  let start = -1

  for (let i = 0; i < mask.length; i += 1) {
    if (mask[i] && start === -1) {
      start = i
    }
    if ((!mask[i] || i === mask.length - 1) && start !== -1) {
      const end = mask[i] && i === mask.length - 1 ? i : i - 1
      ranges.push({ start, end })
      start = -1
    }
  }

  return ranges
}
