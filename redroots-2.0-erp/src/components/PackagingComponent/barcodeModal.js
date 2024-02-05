import React, { useState } from 'react'
import { Button, Modal } from 'antd'
import Barcode from 'react-barcode'
import { BarcodeOutlined } from '@ant-design/icons'

const BarcodeModal = (props) => {
  const { boxDbID, boxName, disabled } = props

  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)

  const handleOk = () => setIsModalVisible(false)

  const handleCancel = () => setIsModalVisible(false)

  return (
    <div>
      <Button
        className="pull-right"
        size="small"
        onClick={() => {
          if (boxDbID) showModal()
        }}
        disabled={!boxDbID || disabled}
      >
        <BarcodeOutlined />
      </Button>

      <Modal
        title="Box Barcode"
        visible={isModalVisible}
        onOk={handleOk}
        centered
        width={300}
        onCancel={handleCancel}
      >
        <div className="text-center">
          <Barcode
            value={boxDbID}
            text={boxName}
            renderer="img"
            width={3}
            options={{
              format: 'EAN13',
              displayValue: true,
              font: 'monospace',
              fontSize: 8,
              textAlign: 'center',
              textPosition: 'bottom',
              textMargin: 2,
              background: '#ffffff',
              lineColor: '#000000',
              margin: 10,
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default BarcodeModal
