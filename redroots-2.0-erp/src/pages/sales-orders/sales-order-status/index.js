import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Spin, Select, Table } from 'antd'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Error403 from 'components/Errors/403'

const Option = Select
const mapStateToProps = ({ user }) => ({ user })

const SalesOrderStatus = ({ user: { permissions } }) => {
  const [brandID, setBrandID] = useState()
  const [buyerID, setSetBuyerID] = useState(null)
  const [statusFilter, setStatusFilter] = useState(undefined)

  const brandNames = [
    { id: 1, name: 'Nelle Harper', value: 'Nelle Harper' },
    { id: 2, name: 'Anna Claire', value: 'Anna Claire' },
    { id: 3, name: 'In Transit', value: 'In Transit' },
    { id: 4, name: 'Tortoise', value: 'Tortoise' },
  ]

  const tableColumns = [
    {
      title: 'SO Number',
      dataIndex: 'so_number',
      key: 'so_number',
      //   width: '8.33%',
    },

    {
      title: 'SO Qty',
      dataIndex: 'so_quantity',
      key: 'so_quantity',
      //   width: '8.33%',
    },
    {
      title: 'SO VALUE',
      dataIndex: 'so_value',
      key: 'so_value',
      //   width: '8.33%',
    },
    {
      title: 'PACK QTY',
      dataIndex: 'pack_qty',
      key: 'pack_qty',
      //   width: '8.33%',
    },
    {
      title: 'INTRANSIT QTY',
      dataIndex: 'intransit_qty',
      key: 'intransit_qty',
      //   width: '8.33%',
    },
    {
      title: 'Delivered Qty',
      dataIndex: 'delivered_qty',
      key: 'delivered_qty',
      //   width: '8.33%',
    },
    {
      title: 'Outstanding Qty',
      dataIndex: 'outstanding_qty',
      key: 'outstanding_qty',
      //   width: '8.33%',
    },
    {
      title: 'Outstanding Value',
      dataIndex: 'outstanding_value',
      key: 'outstanding_value',
      //   width: '8.33%',
    },
    {
      title: 'SOH',
      dataIndex: 'soh',
      key: 'soh',
      //   width: '8.33%',
    },
    {
      title: 'Expected Production Open Qty',
      dataIndex: 'expe_prod_open_qty',
      key: 'expe_prod_open_qty',
      //   width: '8.33%',
    },
    {
      title: 'Expected Production Not Started Qty',
      dataIndex: 'exp_pro_not_started_qty',
      key: 'exp_pro_not_started_qty',
      //   width: '8.33%',
    },
    {
      title: 'Expected Production Inward Date',
      dataIndex: 'exp_prod_inward_date',
      key: 'exp_prod_inward_date',
      //   width: '8.33%',
    },
  ]
  const tableData = [
    {
      id: 1,
      so_number: 12345,
      so_quantity: 100,
      so_value: 500,
      pack_qty: 95,
      intransit_qty: 5,
      delivered_qty: 0,
      outstanding_qty: 0,
      outstanding_value: 0,
      soh: 2450,
      expe_prod_open_qty: 30,
      exp_pro_not_started_qty: 450,
      exp_prod_inward_date: '26-11-2022',
    },
  ]
  if (!permissions.includes('readSalesOrderStatus')) return <Error403 />
  return (
    <div>
      <Helmet title="SO Status" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>SO STATUS</strong>
                </h5>
                <div className="row">
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      // mode="multiple"
                      showSearch
                      value={brandID}
                      onChange={(value) => setBrandID(value)}
                      placeholder="Brand"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {brandNames && brandNames.length
                        ? brandNames.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>

                  <div className="col-lg-2">
                    <Select
                      key="buyerID"
                      value={buyerID || null}
                      placeholder="Filter by status"
                      showSearch
                      onChange={(value) => setSetBuyerID(value)}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 w-100"
                    >
                      <Option key={0} value={null}>
                        Buyers
                      </Option>
                      <Option key={1} value="Cloudtail">
                        Cloudtail
                      </Option>
                      <Option key={3} value="Ajio">
                        Ajio
                      </Option>
                    </Select>
                  </div>

                  <div className="col-lg-2">
                    <Select
                      key="statusFilter"
                      value={statusFilter || null}
                      placeholder="Filter by status"
                      showSearch
                      onChange={(value) => setStatusFilter(value)}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 w-100"
                    >
                      <Option key={0} value={null}>
                        All statuses
                      </Option>
                      <Option key={1} value="Open">
                        Open
                      </Option>
                      <Option key={3} value="Closed">
                        Closed
                      </Option>
                      <Option key={4} value="In Transit">
                        In Transit
                      </Option>
                      <Option key={4} value="Packed">
                        Packed
                      </Option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <Table
                  columns={tableColumns}
                  dataSource={tableData}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                  // scroll={{
                  //   x: 2500,
                  //   y: 600,
                  // }}
                />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(SalesOrderStatus))
