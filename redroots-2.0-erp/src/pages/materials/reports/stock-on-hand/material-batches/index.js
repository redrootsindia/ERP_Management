import React, { useState, useEffect } from 'react'
import { withRouter, useParams, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import {
  Input,
  Select,
  Table,
  Spin,
  Pagination,
  Button,
  Modal,
  InputNumber,
  Space,
  Image,
  notification,
} from 'antd'
import { EyeOutlined } from '@ant-design/icons'

import Error403 from 'components/Errors/403'
import { All_BATCHES_STOCK_BY_MATERIALID, ADD_MATERIAL_WRITE_OFF } from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const MaterialBatch = ({ user: { permissions } }) => {
  const { id } = useParams()

  const [allBatchStockByMaterial, setAllBatchStockByMaterial] = useState([])
  const [MaterialName, setMaterialName] = useState(undefined)
  const [unitPrice, setUnitPrice] = useState(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('batchIDAsc')
  const [writeOff, setWriteOff] = useState('null')
  const [accountWriteOff, setAccountWriteOff] = useState(0)
  const [comments, setComments] = useState(undefined)
  const [writeOffError, setWriteOffError] = useState(undefined)
  const [commentsError, setCommentsError] = useState(undefined)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [imagePrev, setImagePrev] = useState(null)
  const [materialInwardByBatchID, setMaterialInwardByBatchID] = useState(undefined)

  const showModal = () => setIsModalVisible(true)

  const handleCancel = () => {
    setAccountWriteOff(0)
    setComments(undefined)
    setWriteOffError(undefined)
    setCommentsError(undefined)
    setIsModalVisible(false)
  }

  const { loading: BSMLoad, error: BSMErr, data: BSMData } = useQuery(
    All_BATCHES_STOCK_BY_MATERIALID,
    {
      variables: {
        materialID: id,
        sortBy,
        limit,
        offset,
      },
    },
  )

  const [addMaterialWriteOff] = useMutation(ADD_MATERIAL_WRITE_OFF)
  useEffect(() => {
    if (!BSMLoad && BSMData && BSMData.allBatchesStockByMaterialID) {
      const { material_stocks, material_data, count } = BSMData.allBatchesStockByMaterialID
      if (material_data && material_data.image) setImagePrev(material_data.image)
      if (material_stocks) setAllBatchStockByMaterial(material_stocks)
      if (material_data && material_data.material_name)
        setMaterialName(material_data.material_name.toUpperCase())
      if (material_data && material_data.price_per_uom) setUnitPrice(material_data.price_per_uom)
      if (count) setRecordCount(count)
    }
  }, [BSMData, BSMLoad])

  const tableColumns = [
    {
      title: 'Batch #',
      dataIndex: 'material_inward_batch_id',
      key: 'material_inward_batch_id',
    },
    {
      title: 'PO #',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      render: (text) => text || '-',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => text.toFixed(2),
    },
    {
      title: 'Booked Quantity',
      dataIndex: 'booked_quantity',
      key: 'booked_quantity',
      render: (text) => text.toFixed(2),
    },
    {
      title: 'Written-off Quantity',
      dataIndex: 'written_off_quantity',
      key: 'written_off_quantity',
      render: (text) => text.toFixed(2),
    },
    {
      title: 'Balance Quantity',
      dataIndex: 'balance_quantity',
      key: 'balance_quantity',
      render: (text, record) => (record.quantity - record.booked_quantity).toFixed(2),
    },

    {
      title: 'Unit Price',
      dataIndex: 'price_per_uom',
      key: 'price_per_uom',
      render: () => {
        const curr = unitPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Balance Value',
      dataIndex: 'balance_value',
      key: 'balance_value',
      render: (text, record) => {
        const data = (record.quantity - record.booked_quantity) * unitPrice
        const curr = data.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Godown',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: '',
      key: '',
      align: 'center',
      render: (text, record) => (
        <Space size="middle">
          <Link
            to={`/materials/reports/stock-on-hand/material-ledger/${id}/batch/${record.material_inward_batch_id}`}
          >
            <Button type="primary">Ledger View</Button>
          </Link>
          <Button
            type="primary"
            onClick={() => {
              showModal()
              setWriteOff(record.quantity - record.booked_quantity)
              setMaterialInwardByBatchID(record.material_inward_batch_id)
            }}
          >
            Write off
          </Button>
        </Space>
      ),
    },
  ]

  const onSubmit = () => {
    setWriteOffError(undefined)
    setCommentsError(undefined)
    let isError = false
    if (accountWriteOff <= 0) {
      isError = true
      setWriteOffError('Amount should be greater than 0 ')
    }
    if (accountWriteOff > writeOff) {
      isError = true
      setWriteOffError(`Amount cannot be more than  ${writeOff}`)
    }
    if (!comments) {
      isError = true
      setCommentsError('Reason cannot be empty')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    addMaterialWriteOff({
      variables: {
        material_inward_batch_id: materialInwardByBatchID,
        material_id: id,
        written_off_quantity: accountWriteOff,
        reason: comments,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        setAccountWriteOff(0)
        setComments(undefined)
        setWriteOffError(undefined)
        setCommentsError(undefined)
        setIsModalVisible(false)
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while saving Material Write-Off.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readMaterialReport')) return <Error403 />

  if (BSMErr) return `Error occured while fetching data: ${BSMErr.message}`

  return (
    <div>
      <Helmet title="Batch Stock" />

      <Spin spinning={BSMLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <div className="row">
                  <div className="col-lg-11">
                    <h5 className="mb-4">
                      <strong> MATERIAL STOCK-ON-HAND - {MaterialName} </strong>
                    </h5>

                    <div className="row mt-3">
                      <div className="col-lg-10 custom-pad-r0">
                        <Select
                          key="sortBy"
                          value={sortBy || 'batchIDAsc'}
                          style={{ width: '30%' }}
                          placeholder="Sort by Batch $ - Ascending"
                          onChange={(value) => setSortBy(value)}
                          className="custom-pad-r1"
                        >
                          <Option key="batchIDAsc" value="batchIDAsc">
                            Sort by Batch # - Ascending
                          </Option>
                          <Option key="batchIDDesc" value="batchIDDesc">
                            Sort by Batch # - Descending
                          </Option>
                          <Option key="quantityAsc" value="quantityAsc">
                            Sort by Quantity - Ascending
                          </Option>
                          <Option key="quantityDesc" value="quantityDesc">
                            Sort by Quantity - Descending
                          </Option>

                          <Option key="purchaseOrderIDAsc" value="purchaseOrderIDAsc">
                            Sort by PO # - Ascending
                          </Option>
                          <Option key="purchaseOrderIDDesc" value="purchaseOrderIDDesc">
                            Sort by PO # - Descending
                          </Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-1">
                    <div className="text-center mt-3 mr-1">
                      <Image
                        src={
                          process.env.REACT_APP_IMAGE_URL +
                          process.env.REACT_APP_MATERIAL_URL +
                          imagePrev
                        }
                        height={60}
                        width={60}
                        alt="general"
                        fallback="resources/images/placeholder/general.png"
                        preview={{ mask: <EyeOutlined /> }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={allBatchStockByMaterial}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Stock On Hand Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                  />
                  <Modal
                    centered
                    mask={false}
                    title="Write Off"
                    visible={isModalVisible}
                    onOk={onSubmit}
                    onCancel={handleCancel}
                  >
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-2">
                          Amount to Write-off<span className="custom-error-text"> *</span>
                        </div>
                        <InputNumber
                          value={accountWriteOff}
                          onChange={(value) => setAccountWriteOff(value)}
                          // disabled={disabled}
                          // className={moqError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                          style={{ width: '100%' }}
                        />
                        <div className="custom-error-text mb-4">{writeOffError || ''}</div>
                      </div>
                      <div className="col-6">
                        <div className="mb-2">
                          Reason for Write-off<span className="custom-error-text"> *</span>
                        </div>
                        <Input
                          value={comments}
                          onChange={({ target: { value } }) => setComments(value)}
                          placeholder="Reason"
                          // disabled={disabled}
                          // className={moqError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                          style={{ width: '100%' }}
                        />
                        <div className="custom-error-text mb-4">{commentsError || ''}</div>
                      </div>
                    </div>
                    <div className="mt-2">Cannot write-off more than {writeOff}</div>
                  </Modal>
                  <Pagination
                    current={currentPage}
                    showTotal={(total) => `Total ${total} items`}
                    total={recordCount}
                    pageSize={pageSize}
                    pageSizeOptions={[20, 50, 100]}
                    className="custom-pagination"
                    onChange={(page) => {
                      setCurrentPage(page)
                      setOffset((page - 1) * limit)
                    }}
                    showSizeChanger
                    onShowSizeChange={(current, selectedSize) => {
                      setPageSize(selectedSize)
                      setCurrentPage(1)
                      setLimit(selectedSize)
                      setOffset(0)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(MaterialBatch))
