import React, { useState } from 'react'
import { Button, Modal, Image, Tooltip } from 'antd'
import { EyeOutlined, FileDoneOutlined } from '@ant-design/icons'

const ImageModal = (props) => {
  const { challan_image, invoice_image } = props
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)

  const handleOk = () => setIsModalVisible(false)

  const handleCancel = () => setIsModalVisible(false)

  return (
    <div>
      <Tooltip title="View Documents">
        <Button danger onClick={() => showModal()}>
          <FileDoneOutlined />
        </Button>
      </Tooltip>

      <Modal
        title="Uploaded Documents"
        visible={isModalVisible}
        onOk={handleOk}
        centered
        height={400}
        onCancel={handleCancel}
      >
        <div className="row">
          <div className="col-lg-6 text-center">
            <div className="mb-2">
              <strong>Challan</strong>
            </div>
            <Image
              src={
                process.env.REACT_APP_IMAGE_URL +
                process.env.REACT_APP_MATERIAL_INWARDS_URL +
                challan_image
              }
              height={100}
              width={100}
              alt="general"
              fallback="resources/images/placeholder/general.png"
              preview={{ mask: <EyeOutlined /> }}
            />{' '}
          </div>
          <div className="col-lg-6 text-center">
            <div className="mb-2">
              <strong>Invoice</strong>
            </div>
            <Image
              src={
                process.env.REACT_APP_IMAGE_URL +
                process.env.REACT_APP_MATERIAL_INWARDS_URL +
                invoice_image
              }
              height={100}
              width={100}
              alt="general"
              fallback="resources/images/placeholder/general.png"
              preview={{ mask: <EyeOutlined /> }}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ImageModal
