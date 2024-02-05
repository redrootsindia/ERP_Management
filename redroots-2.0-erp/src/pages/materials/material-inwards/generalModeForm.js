import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Table, Button, Input, Select, DatePicker, notification, InputNumber } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@apollo/client'
import moment from 'moment'
import ImageUpload from 'components/ImageUpload'
import { debounce } from 'lodash'
import RollsBatchesExpand from './rollsBatchesExpand'
import { MATERIAL_NAMES_LIST, UPSERT_MATERIAL_INWARD_GENERAL } from './queries'

const { Option } = Select

const GeneralModeForm = ({ action, permissions, disabled, WarehousesList, id, inwardData }) => {
  const {
    inward_date,
    invoice_number,
    warehouse_id,
    challan_image,
    invoice_image,
    batch_data,
  } = inwardData

  const history = useHistory()
  const [inwardDate, setInwardDate] = useState(moment())
  const [inwardDateError, setInwardDateError] = useState(undefined)

  const [invoiceNumber, setInvoiceNumber] = useState(undefined)
  const [invoiceNumberError, setInvoiceNumberError] = useState(undefined)

  const [warehouseID, setWarehouseID] = useState(undefined)
  const [warehouseIDError, setWarehouseIDError] = useState(undefined)

  const [existingChallanImages, setExistingChallanImages] = useState([])
  const [challanImage, setChallanImage] = useState(null)
  const [ischallanImagechanged, setIsChallanImageChanged] = useState(false)

  const [existingInvoiceImages, setExistingInvoiceImages] = useState([])
  const [invoiceImage, setInvoiceImage] = useState(null)
  const [isinvoiceImagechanged, setIsInvoiceImageChanged] = useState(false)

  const [materialIDs, setMaterialIDs] = useState(undefined)
  const [materialIDsError, setMaterialIDsError] = useState(undefined)
  const [materialSearchString, setMaterialSearchString] = useState(undefined)
  const [materialNamesList, setMaterialNamesList] = useState([])

  const [materialDataList, setMaterialDataList] = useState([])

  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertMaterialInwardGeneral] = useMutation(UPSERT_MATERIAL_INWARD_GENERAL)

  const {
    loading: materialLoad,
    error: materialErr,
    data: materialData,
  } = useQuery(MATERIAL_NAMES_LIST, { variables: { searchString: materialSearchString } })

  useEffect(() => {
    if (
      !materialLoad &&
      materialData &&
      materialData.materials &&
      materialData.materials.rows &&
      materialData.materials.rows.length
    )
      setMaterialNamesList(
        materialData.materials.rows.map((obj) => ({
          ...obj,
          ordered_quantity: 0,
          pending_quantity: 0,
        })),
      )
  }, [materialData, materialLoad])

  useEffect(() => {
    const tempMaterialData = materialNamesList.filter((i) => materialIDs.includes(i.id))
    setMaterialDataList(tempMaterialData)
  }, [materialIDs])

  useEffect(() => {
    if (inwardData) {
      if (inward_date) setInwardDate(moment(Number(inward_date)))

      if (invoice_number) setInvoiceNumber(invoice_number)
      if (warehouse_id) setWarehouseID(String(warehouse_id))
      if (challan_image) {
        setChallanImage(challan_image)
        setExistingChallanImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_MATERIAL_INWARDS_URL}${challan_image}`,
        ])
      }
      if (invoice_image) {
        setInvoiceImage(invoice_image)
        setExistingInvoiceImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_MATERIAL_INWARDS_URL}${invoice_image}`,
        ])
      }
      if (batch_data) setMaterialDataList(batch_data)
    }
  }, [inwardData])

  const debouncedMaterialSearch = debounce((value) => setMaterialSearchString(value), 500)

  const addRollsBatches = (rolls, recordID) => {
    const tempNumberOfRolls = JSON.parse(JSON.stringify(materialDataList))
    const foundIndex = tempNumberOfRolls.findIndex((e) => Number(e.id) === Number(recordID))
    if (foundIndex > -1) tempNumberOfRolls[foundIndex].number_of_rolls = Number(rolls)
    setMaterialDataList(tempNumberOfRolls)
  }

  const callback = (rollID, obj) => {
    const tempDatawithRolls = JSON.parse(JSON.stringify(materialDataList))
    const foundIndex = tempDatawithRolls.findIndex((e) => Number(e.id) === Number(rollID))
    if (foundIndex > -1) tempDatawithRolls[foundIndex].batches = obj
    setMaterialDataList(tempDatawithRolls)
  }

  const tableColumns = [
    {
      title: 'Material Code',
      dataIndex: 'material_code',
      key: 'material_code',
    },
    {
      title: 'Material Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => record.name || record.material_name,
    },
    {
      title: 'P.O. Qty.',
      dataIndex: 'ordered_quantity',
      key: 'ordered_quantity',
    },
    {
      title: 'Pending Qty.',
      dataIndex: 'pending_quantity',
      key: 'pending_quantity',
    },
    {
      title: 'No of Rolls',
      dataIndex: 'number_of_rolls',
      key: 'number_of_rolls',
      render: (text, record) => (
        <>
          {action === 'update' ? (
            record.batches.length
          ) : (
            <InputNumber
              disabled={action === 'update'}
              onChange={(e) => addRollsBatches(e, record.id)}
            />
          )}
        </>
      ),
    },
  ]

  const onSubmit = () => {
    setInwardDateError(undefined)
    setMaterialIDsError(undefined)
    setInvoiceNumberError(undefined)
    setWarehouseIDError(undefined)

    let isError = false

    if (!inwardDate) {
      isError = true
      setInwardDateError('Inward Date cannot be empty')
    }

    if (!invoiceNumber) {
      isError = true
      setInvoiceNumberError('Invoice Number cannot be empty')
    }
    if (!warehouseID) {
      isError = true
      setWarehouseIDError('Warehouse name cannot be empty')
    }
    if (!materialIDs) {
      isError = true
      setMaterialIDsError('Materials Data cannot be empty')
    }
    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    const tempBatch_data = []

    materialDataList.forEach((obj) => {
      tempBatch_data.push(
        ...obj.batches.map((e) => ({
          id: e.id,
          material_id: obj.id,
          quantity: e.quantity,
        })),
      )
    })

    upsertMaterialInwardGeneral({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        inward_data: {
          inward_date: String(inwardDate.valueOf()),
          invoice_number: String(invoiceNumber),
          warehouse_id: Number(warehouseID),
          challan_image: challanImage,
          is_challan_image_changed: ischallanImagechanged,
          invoice_image: invoiceImage,
          is_invoice_image_changed: isinvoiceImagechanged,
        },
        batch_data: tempBatch_data,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/materials/material-inwards')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving material inward.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }
  if (materialErr) return `Error occured while fetching data: ${materialErr.message}`
  return (
    <>
      <div className="row mt-4">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-lg-2">
                  <div className="mb-2">
                    <strong>
                      Inward Date<span className="custom-error-text"> *</span>
                    </strong>
                  </div>
                  <div>
                    <DatePicker
                      value={inwardDate}
                      style={{ width: '100%' }}
                      format="Do MMM YYYY"
                      disabled={disabled}
                      className={
                        inwardDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      onChange={(value) => setInwardDate(value)}
                    />
                    <div className="custom-error-text mb-4">{inwardDateError || ''}</div>
                  </div>
                </div>

                <div className="col-lg-2">
                  <div className="mb-2">
                    <strong>
                      Invoice Number<span className="custom-error-text"> *</span>
                    </strong>
                  </div>
                  <Input
                    placeholder="Invoice Number"
                    value={invoiceNumber}
                    disabled={disabled}
                    onChange={({ target: { value } }) => setInvoiceNumber(value)}
                    allowClear
                    className={
                      invoiceNumberError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                    }
                  />
                  <div className="custom-error-text mb-4">{invoiceNumberError || ''}</div>
                </div>

                <div className="col-lg-2">
                  <div className="mb-2">
                    <strong>
                      Warehouse<span className="custom-error-text"> *</span>
                    </strong>
                  </div>
                  <Select
                    value={warehouseID}
                    style={{ width: '100%' }}
                    disabled={disabled}
                    onChange={(value) => setWarehouseID(value)}
                    placeholder="Select Warehouse"
                    className={warehouseIDError ? 'custom-error-border' : ''}
                  >
                    {WarehousesList && WarehousesList.length
                      ? WarehousesList.map((obj) => (
                          <Option key={String(obj.id)} value={String(obj.id)}>
                            {obj.name}
                          </Option>
                        ))
                      : null}
                  </Select>
                  <div className="custom-error-text mb-4">{warehouseIDError || ''}</div>
                </div>
              </div>
              {action === 'create' && (
                <div className="row mt-4">
                  <div className="col-lg-6 mb-2">
                    <strong>
                      Material List<span className="custom-error-text"> *</span>
                    </strong>
                    <Select
                      mode="multiple"
                      showSearch
                      value={materialIDs}
                      style={{ width: '100%' }}
                      onSearch={(value) => debouncedMaterialSearch(value)}
                      onChange={(value) => setMaterialIDs(value)}
                      className={
                        materialIDsError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      placeholder="Select Material"
                    >
                      {materialNamesList && materialNamesList.length
                        ? materialNamesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{materialIDsError || ''}</div>
                  </div>
                </div>
              )}
              <div className="row mt-4">
                <div className="col-lg-3">
                  <div className="mb-2">
                    <strong>Challan</strong>
                  </div>
                  <ImageUpload
                    existingImages={existingChallanImages}
                    placeholderType="general"
                    onUploadCallback={(imgFile) => {
                      setChallanImage(imgFile)
                      setIsChallanImageChanged(true)
                    }}
                    onRemoveCallback={() => {
                      setChallanImage(null)
                      setIsChallanImageChanged(true)
                    }}
                    maxImages={1}
                    editMode={!disabled}
                  />
                </div>
                <div className="col-lg-3">
                  <div className="mb-2">
                    <strong>Invoice</strong>
                  </div>
                  <ImageUpload
                    existingImages={existingInvoiceImages}
                    placeholderType="general"
                    onUploadCallback={(imgFile) => {
                      setInvoiceImage(imgFile)
                      setIsInvoiceImageChanged(true)
                    }}
                    onRemoveCallback={() => {
                      setInvoiceImage(null)
                      setIsInvoiceImageChanged(true)
                    }}
                    maxImages={1}
                    editMode={!disabled}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {materialDataList && materialDataList.length ? (
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={materialDataList}
                    pagination={{
                      defaultPageSize: 20,
                      showSizeChanger: true,
                      pageSizeOptions: ['20', '40', '60'],
                    }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <RollsBatchesExpand
                          record={record}
                          disabled={disabled}
                          action={action}
                          parentCallback={callback}
                        />
                      ),
                    }}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Data Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="row mt-3 mb-4 ml-2">
          {(action === 'create' && permissions.includes('createMaterialInward')) ||
          (action === 'update' && permissions.includes('updateMaterialInward')) ? (
            <Button type="primary" onClick={onSubmit}>
              {okText}
            </Button>
          ) : null}
          &emsp;
          <Button danger onClick={() => history.goBack()}>
            Back
          </Button>
        </div>
      </div>
    </>
  )
}

export default GeneralModeForm
