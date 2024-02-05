import React from 'react'
import { Helmet } from 'react-helmet'
import { Spin, Table } from 'antd'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Error403 from 'components/Errors/403'
import moment from 'moment'

// const Option = Select
const mapStateToProps = ({ user }) => ({ user })

const VendorDetails = ({ user: { permissions } }) => {
  const tableColumns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },

    {
      title: 'Vendor Invoice',
      dataIndex: 'vendor_invoice',
      key: 'vendor_invoice',
    },
    {
      title: 'Invoice Qty',
      dataIndex: 'invoice_qty',
      key: 'invoice_qty',
    },
    {
      title: 'VENDOR INVOICE DATE',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(Number(text)).format('MMM Do YYYY'),
    },
    {
      title: 'Base Value',
      dataIndex: 'base_value',
      key: 'base_value',
    },
    {
      title: 'Tax Value',
      dataIndex: 'tax_value',
      key: 'tax_value',
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
    },
    {
      title: 'Payment Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
    },
  ]
  const tableData = [
    {
      id: 1,
      vendor_invoice: 'VICE0001',
      invoice_qty: 300,
      date: '1669782043000',
      base_value: 200,
      tax_value: 2000,
      total_value: 6000,
      payment_status: 'not approved',
    },
  ]
  if (!permissions.includes('readBrandPayment')) return <Error403 />
  return (
    <div>
      <Helmet title="Vendor Invoice Details" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>VENDOR INVOICE DETAILS</strong>
                </h5>
              </div>
              <div className="card-body">
                <Table
                  columns={tableColumns}
                  dataSource={tableData}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(VendorDetails))
