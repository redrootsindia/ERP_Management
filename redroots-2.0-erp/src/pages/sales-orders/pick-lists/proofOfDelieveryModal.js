import React, { useState, useEffect } from 'react'
import { Button, Modal, notification } from 'antd'
import { useMutation, useLazyQuery } from '@apollo/client'
import ImageUpload from 'components/ImageUpload'
import { cloneDeep } from 'lodash'
import { SALES_ORDER_DELIVERY, PROOF_OF_DELIVERY } from './queries'

const PODModal = ({ id }) => {
  const [packagingListID, setPackagingListID] = useState(id)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const [podUploadedImages, setPODUploadedImages] = useState([])
  const [podExistingImages, setPODExistingImages] = useState([])
  const [deletedPODImages, setDeletedPODImages] = useState([])

  const [grnUploadedImages, setGRNUploadedImages] = useState([])
  const [grnExistingImages, setGRNExistingImages] = useState([])
  const [deletedGRNImages, setDeletedGRNImages] = useState([])

  const [proofOfDelivery] = useMutation(PROOF_OF_DELIVERY)

  const [
    getPODImages,
    { loading: proofOfDeliveryLoad, error: proofOfDeliveryErr, data: proofOfDeliveryData },
  ] = useLazyQuery(SALES_ORDER_DELIVERY, { variables: { id: packagingListID } })

  useEffect(() => {
    if (!proofOfDeliveryLoad && proofOfDeliveryData && proofOfDeliveryData.salesOrderDelivery) {
      const { proof_of_delivery_images, grn_images, packaging_list_id } =
        proofOfDeliveryData.salesOrderDelivery
      if (proof_of_delivery_images && proof_of_delivery_images.length)
        setPODExistingImages(proof_of_delivery_images)
      if (grn_images && grn_images.length) setGRNExistingImages(grn_images)
      if (packaging_list_id) setPackagingListID(packaging_list_id)
    }
  }, [proofOfDeliveryLoad, proofOfDeliveryData])

  const showModal = () => setIsModalVisible(true)

  const onSubmit = () => {
    const combinePODImages = [...podUploadedImages, ...podExistingImages]
    const combineGRNImages = [...grnUploadedImages, ...grnExistingImages]
    if (
      !(combinePODImages && combinePODImages.length) ||
      !(combineGRNImages && combineGRNImages.length)
    ) {
      notification.error({
        message: 'Incorrect Data',
        description: " Please select images to upload (don't close the modal yet)",
      })
      return
    }

    proofOfDelivery({
      variables: {
        packaging_list_id: Number(id),
        proof_of_delivery_images: podUploadedImages,
        deleted_proof_of_delivery_images: deletedPODImages,
        deleted_grn_images: deletedGRNImages,
        grn_images: grnUploadedImages,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        setPODUploadedImages([])
        setGRNUploadedImages([])
        setIsModalVisible(false)
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while saving Proof of delivery.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const handleCancel = () => {
    setPODUploadedImages([])
    setGRNUploadedImages([])
    setIsModalVisible(false)
  }

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          showModal()
          getPODImages()
        }}
      >
        POD Upload
      </Button>

      <Modal
        title="Proof of Delivery"
        visible={isModalVisible}
        onOk={onSubmit}
        centered
        width={600}
        onCancel={handleCancel}
      >
        {proofOfDeliveryErr ? (
          <span>{`Error occured while fetching data: ${proofOfDeliveryErr.message}`}</span>
        ) : (
          <div className="row">
            <div className="col-lg-6 text-center">
              <div className="mb-2">
                <strong>Proof of delievery</strong>
              </div>
              <ImageUpload
                existingImages={podExistingImages || []} // Always pass an array. If not empty, it should have names of files, without URL
                prependURL={
                  process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_SALES_ORDER_DELIVERY_URL
                }
                placeholderType="general" // Accepted values: 'general' or 'profile'
                onUploadCallback={(img) => setPODUploadedImages([...podUploadedImages, img])}
                onRemoveCallback={(imgName, isNew) => {
                  if (isNew) {
                    let tempImages = cloneDeep(podUploadedImages)
                    tempImages = tempImages.filter((obj) => obj.name !== imgName)
                    setPODUploadedImages(tempImages)
                  } else setDeletedPODImages([...deletedPODImages, imgName])
                }}
                editMode
                maxImages={4}
              />
            </div>
            <div className="col-lg-6 text-center">
              <div className="mb-2">
                <strong>GRN</strong>
              </div>
              <ImageUpload
                existingImages={grnExistingImages || []} // Always pass an array. If not empty, it should have names of files, without URL
                prependURL={
                  process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_SALES_ORDER_DELIVERY_URL
                }
                placeholderType="general" // Accepted values: 'general' or 'profile'
                onUploadCallback={(img) => setGRNUploadedImages([...grnUploadedImages, img])}
                onRemoveCallback={(imgName, isNew) => {
                  if (isNew) {
                    let tempImages = cloneDeep(grnUploadedImages)
                    tempImages = tempImages.filter((obj) => obj.name !== imgName)
                    setGRNUploadedImages(tempImages)
                  } else setDeletedGRNImages([...deletedGRNImages, imgName])
                }}
                editMode
                maxImages={4}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PODModal
