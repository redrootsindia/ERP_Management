import React, { useState } from 'react'
import { Modal } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const ConfirmDiscard = (props) => {
  const { discardModalVisible, discardModalVisibleCallback } = props
  const [okText, setOkText] = useState('Discard')
  // console.log(' IN MODAL discardModalVisible ', discardModalVisible)

  const handleOk = async () => {
    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Discarding ...
      </span>,
    )
    discardModalVisibleCallback(false, true)
    setOkText('Discard')
    return true
  }

  const handleCancel = () => discardModalVisibleCallback(false, false)

  return (
    <>
      <Modal
        title="Discard changes"
        width="40vw"
        visible={discardModalVisible}
        onOk={handleOk}
        okText={okText}
        onCancel={handleCancel}
        okButtonProps={{ type: 'primary' }}
      >
        Changes made in the form will be discarded.
        <br />
        Continue?
      </Modal>
    </>
  )
}

export default ConfirmDiscard
