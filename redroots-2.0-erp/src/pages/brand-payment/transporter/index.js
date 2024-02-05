import React from 'react'
import { Helmet } from 'react-helmet'
import { Spin, Table } from 'antd'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Error403 from 'components/Errors/403'
import moment from 'moment'

// const Option = Select
const mapStateToProps = ({ user }) => ({ user })

const TransporterDetails = ({ user: { permissions } }) => {
  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      // width: '8.33%',
    },

    {
      title: 'Transporter Name',
      dataIndex: 'transporter_name',
      key: 'transporter_name',
      //   render: (text) => moment(Number(text)).format('MMM Do YYYYY'),
      // width: '8.33%',
    },
    {
      title: 'Shipped By',
      dataIndex: 'shipped_by',
      key: 'shipped_by',
      //   render: (text) => moment(Number(text)).format('MMM Do YYYY'),
      // width: '8.33%',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      //   render: (text) => moment(Number(text)).format('MMM Do YYYY'),
      // width: '8.33%',
    },
    {
      title: 'Vechile No',
      dataIndex: 'vichile_no',
      key: 'vichile_no',
      // width: '8.33%',
    },
    {
      title: 'Contact No.',
      dataIndex: 'contact_number',
      key: 'contact_number',
      // width: '8.33%',
    },
    {
      title: 'E-Way Bill',
      dataIndex: 'eway_bill',
      key: 'eway_bill',
      // width: '8.33%',
    },
    {
      title: 'FIRC Copy',
      dataIndex: 'firc_copy',
      key: 'firc_copy',
    },
    {
      title: 'FIRC Doc NO',
      dataIndex: 'firc_doc_no',
      key: 'firc_doc_no',
    },
    {
      title: 'Hand Over Status',
      dataIndex: 'hand_over_status',
      key: 'hand_over_status',
    },

    {
      title: 'BOOKING DATE',
      dataIndex: 'booking_date',
      key: 'booking_date',
      render: (text) => moment(Number(text)).format('MMM Do YYYY'),

      // width: '8.33%',
    },
    {
      title: 'Hand Over Date',
      dataIndex: 'hand_over_date',
      key: 'hand_over_date',
      render: (text) => moment(Number(text)).format('MMM Do YYYY'),
    },
    {
      title: 'Shipping Bill No',
      dataIndex: 'shiping_bill_no',
      key: 'shiping_bill_no',
    },
    {
      title: 'MM Copy Status',
      dataIndex: 'mm_copy_status',
      key: 'mm_copy_status',
    },
    {
      title: 'Invoice Creation Date',
      dataIndex: 'invoice_creation_date',
      key: 'invoice_creation_date',
      render: (text) => moment(Number(text)).format('MMM Do YYYY'),
    },
    {
      title: 'VC Inv Creation Status',
      dataIndex: 'vc_invoice_creation_status',
      key: 'vc_invoice_creation_status',
    },
  ]
  const tableData = [
    {
      id: 1,
      booking_date: '1669452033200',
      transporter_name: 'Sai Logistic',
      brand_name: 'Kanvas Katha',
      vichile_no: 'MH04 H1168',
      eway_bill: 241534391796,
      shipped_by: 'Sai Logistic',
      location: 'Nagpur',
      hand_over_status: 'Delivered',
      hand_over_date: '1673592532000',
      invoice_creation_date: '1673333332000',
      vc_invoice_creation_status: '-',
      consignment_number: 118451,
      shiping_bill_no: '-',
      mm_copy_status: '-',
      firc_doc_no: '-',
      firc_copy: '-',
      contact_number: 7977956231,
    },
  ]
  if (!permissions.includes('readBrandPayment')) return <Error403 />
  return (
    <div>
      <Helmet title="Transpoter Invoice Details" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>TRANSPORTER INVOICE DETAILS</strong>
                </h5>
              </div>
              <div className="card-body">
                <Table
                  columns={tableColumns}
                  dataSource={tableData}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                  scroll={{
                    x: 2500,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(TransporterDetails))
