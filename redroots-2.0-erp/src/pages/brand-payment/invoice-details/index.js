import React from 'react'
import { Helmet } from 'react-helmet'
import { Spin, Table } from 'antd'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Error403 from 'components/Errors/403'
import moment from 'moment'

// const Option = Select
const mapStateToProps = ({ user }) => ({ user })

const InvoiceDetails = ({ user: { permissions } }) => {
  const tableColumns = [
    {
      title: 'APPOINTMENT ID',
      dataIndex: 'id',
      key: 'id',
      // width: '8.33%',
    },

    {
      title: 'APPOINTMENT DATE',
      dataIndex: 'appointment_date',
      key: 'appointment_date',
      render: (text) => moment(Number(text)).format('MMM Do YYYYY'),
      // width: '8.33%',
    },
    {
      title: 'Appointmnet Time',
      dataIndex: 'appointment_time',
      key: 'appointment_time',
      render: (text) => moment(Number(text)).format('h:mm a'),
    },
    {
      title: 'DISPATCH DATE',
      dataIndex: 'dispatch_date',
      key: 'dispatch_date',
      render: (text) => moment(Number(text)).format('MMM Do YYYY'),
      // width: '8.33%',
    },
    {
      title: 'TCS',
      dataIndex: 'tcs',
      key: 'tcs',
    },
    {
      title: 'AMS',
      dataIndex: 'ams',
      key: 'ams',
    },
    {
      title: 'Shipped FROM',
      dataIndex: 'shipped_from',
      key: 'shipped_from',
      // width: '8.33%',
    },
    {
      title: 'SHIPPING DESTINATION',
      dataIndex: 'shipment_destination',
      key: 'shipment_destination',
      // width: '8.33%',
    },
    {
      title: 'SHIPMENT STATUS',
      dataIndex: 'shipment_status',
      key: 'shipment_status',
      // width: '8.33%',
    },
    {
      title: 'DELIVERY DATE',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      render: (text) => moment(Number(text)).format('MMM Do YYYY'),

      // width: '8.33%',
    },
    {
      title: 'Transporter',
      dataIndex: 'transporter',
      key: 'transporter',
    },
    {
      title: 'HSN NO',
      dataIndex: 'hsn_no',
      key: 'hsn_no',
    },
    // {
    //   title: 'TRANSPORTER INVOICE',
    //   dataIndex: 'transport_invoice',
    //   key: 'transport_invoice',
    //   render: (text) => <Link to="/brand-payment/transporter">{text}</Link>,
    // },
  ]
  const tableData = [
    {
      id: 1,
      appointment_date: '1669452033200',
      dispatch_date: '1669782043000',
      appointment_time: '1670263229000',
      shipped_from: '3 arrows',
      shipment_destination: 'Banglore',
      shipment_status: 'approved',
      delivery_date: '1608894043300',
      transporter: 'Sai logistic',
      hsn_no: 'ACCMH001',
      // transport_invoice: 'TSPRRI001',
    },
  ]
  if (!permissions.includes('readBrandPayment')) return <Error403 />
  return (
    <div>
      <Helmet title="Invoice Details" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>INVOICE DETAILS</strong>
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

export default withRouter(connect(mapStateToProps)(InvoiceDetails))
