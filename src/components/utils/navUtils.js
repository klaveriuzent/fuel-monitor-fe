export const buildRouteTitles = (nav) => {
  const titles = {}

  const traverse = (items) => {
    items.forEach((item) => {
      if (item.to) {
        const name =
          typeof item.name === 'string' ? item.name : item.name?.props?.children?.[0] || 'Untitled'
        titles[item.to] = name
      }
      if (item.items) {
        traverse(item.items)
      }
    })
  }

  traverse(nav)
  return titles
}
