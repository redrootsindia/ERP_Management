import React, { useState, useEffect } from 'react'
import { withRouter, useParams, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Select, Table, Spin, Image, Space, Button } from 'antd'
import { EyeOutlined } from '@ant-design/icons'

import Error403 from 'components/Errors/403'
import { MATERIAL_LIST } from './queries'
import { MATERIALS } from '../../../all-materials/queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const MaterialsubCategory = ({ user: { permissions } }) => {
  const { id } = useParams()

  const [subcategoryID] = useState(id)
  const [materialSubCategoryIDs, setMaterialSubCategoryIDs] = useState([])

  const [materialList, setMaterialList] = useState([])
  const [materials, setMaterials] = useState([])
  const [materialName, setMaterialName] = useState(undefined)

  const [sortBy, setSortBy] = useState('materialCodeAsc')

  const {
    loading: MSLoad,
    error: MSErr,
    data: MSData,
  } = useQuery(MATERIALS, {
    variables: { materialSubcategoryIDs: [subcategoryID] },
  })

  const {
    loading: MLLoad,
    error: MLErr,
    data: MLData,
  } = useQuery(MATERIAL_LIST, {
    variables: { subcategoryID, materialIDs: materialSubCategoryIDs, sortBy },
  })

  useEffect(() => {
    if (MLData && MLData.materialStockBySubcategoryID) {
      const { material_stock } = MLData.materialStockBySubcategoryID
      setMaterials(material_stock)
      setMaterialName(MLData.materialStockBySubcategoryID.subcategory.toUpperCase())
    } else {
      setMaterials([])
    }
  }, [MLData])

  useEffect(() => {
    if (
      !MSLoad &&
      MSData &&
      MSData.materials &&
      MSData.materials.rows &&
      MSData.materials.rows.length
    )
      setMaterialList(MSData.materials.rows)
  }, [MSData, MSLoad])

  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_MATERIAL_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Material Name',
      dataIndex: 'material_name',
      key: 'material_name',
    },
    {
      title: 'Material Code',
      dataIndex: 'material_code',
      key: 'material_code',
    },
    {
      title: 'Total Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => text.toFixed(2),
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (text, record) => {
        const data = record.quantity * record.price_per_uom
        const curr = data.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Booked Quantity',
      dataIndex: 'booked_quantity',
      key: 'booked_quantity',
      render: (text) => text.toFixed(2),
    },
    {
      title: 'Booked Value',
      dataIndex: 'booked_value',
      key: 'booked_value',
      render: (text, record) => {
        const data = record.booked_quantity * record.price_per_uom
        const curr = data.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Balance Quantity',
      dataIndex: 'balance_quantity',
      key: 'balance_quantity',
      render: (text, record) => (record.quantity - record.booked_quantity).toFixed(2),
    },
    {
      title: 'Balance Value',
      dataIndex: 'balance_value',
      key: 'balance_value',
      render: (text, record) => {
        const data = (record.quantity - record.booked_quantity) * record.price_per_uom
        const curr = data.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (text, record) => (
        <Space size="middle">
          <Link to={`/materials/reports/stock-on-hand/material-batches/${record.material_id}`}>
            <Button type="primary">Batch Detail View</Button>
          </Link>
          <Link to={`/materials/reports/stock-on-hand/material-ledger/${record.material_id}`}>
            <Button type="primary">Ledger View</Button>
          </Link>
        </Space>
      ),
    },
  ]

  if (!permissions.includes('readMaterialReport')) return <Error403 />
  if (MSErr) return `Error occured while fetching data: ${MSErr.message}`
  if (MLErr) return `Error occured while fetching data: ${MLErr.message}`

  return (
    <div>
      <Helmet title="Sub-Category" />

      <Spin spinning={MLLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong> MATERIAL STOCK-ON-HAND - {materialName} SUBCATEGORY </strong>
                </h5>

                <div className="row">
                  <div className="col-lg-10 custom-pad-r0">
                    <Select
                      mode="multiple"
                      value={materialSubCategoryIDs || []}
                      style={{ width: '25%' }}
                      onChange={(value) => setMaterialSubCategoryIDs(value)}
                      placeholder="Filter by Material Subcategory"
                      className="custom-pad-r1"
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {materialList && materialList.length
                        ? materialList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>

                    <Select
                      key="sortBy"
                      value={sortBy || 'materialCodeAsc'}
                      style={{ width: '30%' }}
                      placeholder="Sort by materialCode - A to Z"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="materialCodeAsc" value="materialCodeAsc">
                        Sort by Material Code- A to Z
                      </Option>
                      <Option key="materialCodeDesc" value="materialCodeDesc">
                        Sort by Material Code- Z to A
                      </Option>
                      <Option key="totalQtyAsc" value="totalQtyAsc">
                        Sort by Total Quantity - Ascending
                      </Option>
                      <Option key="totalQtyDesc" value="totalQtyDesc">
                        Sort by Total Quantity - Descending
                      </Option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={materials}
                    pagination={{
                      defaultPageSize: 20,
                      showSizeChanger: true,
                      pageSizeOptions: ['20', '40', '60'],
                    }}
                    rowKey={(record) => String(record.material_id)}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(MaterialsubCategory))
