import React, { useState, useEffect } from 'react'
import { Button, Modal, Table, Spin } from 'antd'
import { useLazyQuery } from '@apollo/client'
import { capitalize } from 'lodash'

import { SALES_ORDER_INVENTORY_BREAKDOWN } from './queries'

const StatusModal = (props) => {
  const { id, sales_order_id } = props

  const [pickListStatus, setPickListStatus] = useState(undefined)
  const [inventoryBreakDown, setInventoryBreakDown] = useState(undefined)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)

  const handleOk = () => setIsModalVisible(false)

  const handleCancel = () => setIsModalVisible(false)

  const [
    getInventoryBreakdown,
    { loading: soiLoad, data: soiData, error: soiErr },
  ] = useLazyQuery(SALES_ORDER_INVENTORY_BREAKDOWN, { variables: { id } })

  useEffect(() => {
    if (soiData && soiData.salesOrderInventoryBreakdown) {
      const { pick_list_status, inventory_breakdown } = soiData.salesOrderInventoryBreakdown
      setPickListStatus(pick_list_status)
      setInventoryBreakDown(inventory_breakdown)
    }
  }, [soiData, id])

  const pendingColumns = [
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: 'Available Stock',
      dataIndex: 'available_stock',
      key: 'available_stock',
    },
    {
      title: 'Total Scheduled to Pick',
      dataIndex: 'total_scheduled_to_pick',
      key: 'total_scheduled_to_pick',
    },
    {
      title: 'Picked Qty',
      dataIndex: 'picked_quantity',
      key: 'picked_quantity',
    },
    {
      title: 'Pending Qty',
      key: 'pending_quantity',
      render: (text, record) => {
        if (
          record.total_scheduled_to_pick === 0 ||
          record.total_scheduled_to_pick <= record.picked_quantity
        ) {
          return 0
        }
        return record.total_scheduled_to_pick - record.picked_quantity
      },
    },
  ]

  const completeColumns = [
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },

    {
      title: 'Picked Qty',
      dataIndex: 'picked_quantity',
      key: 'picked_quantity',
    },
  ]

  const modalTitle = (
    <>
      Inventory Breakdown for S.O. : <strong>{sales_order_id}</strong>
      &emsp;(Pick List Status: {capitalize(pickListStatus)})
    </>
  )

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          showModal()
          getInventoryBreakdown()
        }}
        className="mr-2"
      >
        View
      </Button>

      <Modal
        title={modalTitle}
        visible={isModalVisible}
        onOk={handleOk}
        centered
        width={1000}
        onCancel={handleCancel}
      >
        <Spin spinning={soiLoad} tip="Loading..." size="large">
          {soiErr ? (
            <>Error occured while fetching data: {soiErr.message}</>
          ) : (
            <Table
              columns={pickListStatus === 'pending' ? pendingColumns : completeColumns}
              dataSource={inventoryBreakDown}
              pagination={
                inventoryBreakDown >= 20
                  ? {
                      defaultPageSize: 20,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '30'],
                    }
                  : false
              }
              rowKey={(record) => String(record.id)}
              locale={{
                emptyText: (
                  <>
                    <i className="fe fe-search" />
                    <br />
                    <h5>No Sales Order Report Found</h5>
                  </>
                ),
              }}
            />
          )}
        </Spin>
      </Modal>
    </div>
  )
}

export default StatusModal
