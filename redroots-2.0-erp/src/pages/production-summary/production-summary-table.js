import React from 'react'
import { Table } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component'

function SummaryTable({ tableColumns, data, hashMore, limit, setHasMore, setLimit }) {
  return (
    <div>
      <InfiniteScroll
        dataLength={data.length}
        next={() => {
          setLimit(limit + 20)
          if (data.length >= 500) setHasMore(false)
        }}
        hasMore={hashMore}
        // loader={<Spin spinning={data} tip="Loading..." size="large" className="pt-2" />}
      >
        <Table
          columns={tableColumns}
          dataSource={data}
          pagination={false}
          onHeaderRow={() => ({ className: 'custom-header-small-font' })}
          rowKey={(record) => String(record.id)}
          scroll={{ x: 2900 }}
          locale={{
            emptyText: (
              <div className="custom-empty-text-parent">
                <div className="custom-empty-text-child">
                  <i className="fe fe-search" />
                  <h5>No Production Summary Found</h5>
                </div>
              </div>
            ),
          }}
        />
      </InfiniteScroll>
    </div>
  )
}

export default SummaryTable
