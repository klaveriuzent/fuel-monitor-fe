import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Empty, Pagination, Spin, Table } from 'antd'
import './ResponsiveTableCards.scss'

const ResponsiveTableCards = ({
  dataSource = [],
  loading = false,
  emptyText = 'No data',
  mobileBreakpoint = 768,
  mobilePageSize = 8,
  renderCard,
  rowKey = 'key',
  tableProps = {},
}) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= mobileBreakpoint)
  const [mobilePage, setMobilePage] = useState(1)

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= mobileBreakpoint)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mobileBreakpoint])

  useEffect(() => {
    setMobilePage(1)
  }, [dataSource.length, mobilePageSize, isMobile])

  const pagedMobileData = useMemo(() => {
    const start = (mobilePage - 1) * mobilePageSize
    return dataSource.slice(start, start + mobilePageSize)
  }, [dataSource, mobilePage, mobilePageSize])

  if (!isMobile) {
    return <Table {...tableProps} dataSource={dataSource} loading={loading} rowKey={rowKey} />
  }

  return (
    <div className="responsive-table-cards">
      {loading && (
        <div className="responsive-table-cards__loading">
          <Spin />
        </div>
      )}

      {!loading && !dataSource.length && <Empty description={emptyText} />}

      {!loading && dataSource.length > 0 && (
        <>
          <div className="responsive-table-cards__list">
            {pagedMobileData.map((record, index) => (
              <div
                key={
                  (typeof rowKey === 'function' ? rowKey(record) : record?.[rowKey]) ||
                  `${mobilePage}-${index}`
                }
              >
                {renderCard(record, index)}
              </div>
            ))}
          </div>

          {dataSource.length > mobilePageSize && (
            <div className="responsive-table-cards__pagination">
              <Pagination
                current={mobilePage}
                pageSize={mobilePageSize}
                total={dataSource.length}
                onChange={setMobilePage}
                showSizeChanger={false}
                size="small"
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

ResponsiveTableCards.propTypes = {
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
  emptyText: PropTypes.string,
  mobileBreakpoint: PropTypes.number,
  mobilePageSize: PropTypes.number,
  renderCard: PropTypes.func.isRequired,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  tableProps: PropTypes.object,
}

export default ResponsiveTableCards
