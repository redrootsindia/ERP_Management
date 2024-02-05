import React, { useState, useEffect } from 'react'
import { Select, Input, Popconfirm, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import ImageUpload from 'components/ImageUpload'
import _ from 'lodash'

const { Option } = Select

const PackComponent = (props) => {
  const {
    containsSameProduct,
    uniqueKey,
    disabled,
    deletePack,
    productVariants,
    packOf,
    getPackData,
    divError,
    packDiv,
    action,
  } = props

  const [disabledUpdate] = useState(packDiv.length > 0)
  const [variantIDs, setVariantIDs] = useState([])
  const [packData, setPackData] = useState(
    packDiv.length
      ? packDiv[0]
      : {
          key: uniqueKey,
          isNew: true,
          packCode: '',
          ean: '',
          asin: '',
          packImage: null,
          is_image_changed: undefined,
          productVariantObjs: {},
        },
  )

  useEffect(() => {
    if (packDiv.length) {
      const tempVariantIDs = []
      for (let i = 0; i < packDiv[0].productVariantObjs.length; i += 1) {
        tempVariantIDs.push(packDiv[0].productVariantObjs[i].variant_id)
      }
      setVariantIDs(tempVariantIDs)
    }
  }, [packDiv])

  const deleteDiv = () => deletePack(uniqueKey)

  const getVariants = () => {
    const variant = []
    if (containsSameProduct) {
      variant.push(
        productVariants && productVariants.length ? (
          <div className="col-lg-4" key={0}>
            <div className="mb-1">Select Variant</div>
            <Select
              showSearch
              value={variantIDs[0]}
              onChange={(value) => {
                const getProductVariantsObj = _.find(productVariants[0], {
                  variant_id: value,
                })
                onChangeEvent('productVariantObjs', {
                  0: {
                    product_id: getProductVariantsObj.product_id,
                    variant_id: getProductVariantsObj.variant_id,
                  },
                })
              }}
              disabled={disabled || disabledUpdate}
              style={{ width: '100%' }}
            >
              {productVariants[0] && productVariants[0].length
                ? productVariants[0].map((item) => (
                    <Option key={item.variant_id} value={item.variant_id}>
                      {`${item.code} (${item.name})`}
                    </Option>
                  ))
                : null}
            </Select>
          </div>
        ) : null,
      )
    } else {
      for (let i = 0; i < packOf; i += 1) {
        let variantsList = []

        if (action === 'update' && variantIDs[i]) {
          const foundIndex = productVariants.findIndex((obj) => {
            let exists = false
            if (obj && obj.length) {
              obj.forEach((innerObj) => {
                if (Number(innerObj.variant_id) === Number(variantIDs[i])) exists = true
              })
            }
            if (exists) return true
            return false
          })
          if (foundIndex > -1) variantsList = productVariants[foundIndex]
        } else variantsList = productVariants[i]

        variant.push(
          productVariants && productVariants.length ? (
            <div className="col-lg-4" key={i}>
              <div className="mb-1">
                Variant {i + 1}
                <span className="custom-error-text"> *</span>
              </div>
              <Select
                showSearch
                value={variantIDs[i]}
                onChange={(value) => {
                  setVariantIDs({ ...variantIDs, [i]: value })
                  const tempProductVariantsObj = _.find(productVariants[i], {
                    variant_id: value,
                  })
                  onChangeEvent('productVariantObjs', {
                    [i]: {
                      product_id: tempProductVariantsObj.product_id,
                      variant_id: tempProductVariantsObj.variant_id,
                    },
                  })
                }}
                disabled={disabled || disabledUpdate}
                style={{ width: '100%' }}
              >
                {variantsList && variantsList.length
                  ? variantsList.map((item) => (
                      <Option key={item.variant_id} value={item.variant_id}>
                        {`${item.code} (${item.name})`}
                      </Option>
                    ))
                  : null}
              </Select>
            </div>
          ) : null,
        )
      }
    }

    return <div className="row mb-4">{variant}</div>
  }

  const onChangeEvent = (key, data) => {
    if (key !== 'productVariantObjs' && key !== 'packImage') {
      setPackData({ ...packData, [`${key}`]: data })
    } else if (key === 'productVariantObjs') {
      setPackData({ ...packData, [`${key}`]: { ...packData.productVariantObjs, ...data } })
    } else if (key === 'packImage') {
      const tempImageObj = {
        [`${key}`]: data || null,
        is_image_changed: true,
      }
      setPackData({ ...packData, ...tempImageObj })
    }
  }

  useEffect(() => getPackData(packData, uniqueKey), [packData])

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <div className="col-9">
            <h6 className="text-black mb-4">
              <strong>{packData.packName ? `${packData.packName} - Detail` : ''}</strong>
            </h6>
          </div>
          {!packDiv.length ? (
            <div className="col-3">
              <Popconfirm title="Sure to delete the box?" onConfirm={deleteDiv}>
                <Button className="pull-right" size="small" type="danger" disabled={disabled}>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            </div>
          ) : null}
        </div>

        <div className="row mb-1">
          <div className="col-lg-10">
            <div className="row">
              <div className="col-lg-4">
                <div className="mb-1">
                  Pack Code<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={packData.packCode}
                  className={
                    divError.packCode ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  onChange={({ target: { value } }) => onChangeEvent('packCode', value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{divError.packCode || ''}</div>
              </div>
              <div className="col-lg-4">
                <div className="mb-1">EAN</div>
                <Input
                  value={packData.ean}
                  onChange={({ target: { value } }) => onChangeEvent('ean', value)}
                  disabled={disabled}
                />
              </div>

              <div className="col-lg-4">
                <div className="mb-1">ASIN</div>
                <Input
                  value={packData.asin}
                  onChange={({ target: { value } }) => onChangeEvent('asin', value)}
                  disabled={disabled}
                />
              </div>
            </div>

            {getVariants()}
          </div>

          <div className="col-lg-2">
            <div className="mb-1">Pack Image</div>
            <ImageUpload
              existingImages={packData.packImage} // Always pass an array. If not empty, it should have fully-formed URLs of images
              placeholderType="general" // Accepted values: 'general' or 'profile'
              onUploadCallback={(imgFile) => onChangeEvent('packImage', imgFile)}
              onRemoveCallback={() => onChangeEvent('packImage', null)}
              maxImages={1}
              editMode={!disabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackComponent
