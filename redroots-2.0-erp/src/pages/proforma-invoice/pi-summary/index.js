import React from 'react'
import { Helmet } from 'react-helmet'
import { Table, Spin } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Error403 from 'components/Errors/403'

const mapStateToProps = ({ user }) => ({ user })
const Pisummary = ({ user: { permissions } }) => {
  const tableColumns = [
    {
      title: 'PI NO.',
      dataIndex: 'pi_num',
      key: 'pi_num',
      fixed: true,
      render: (text, record) => {
        return {
          props: {
            style: { background: record.current_soh > 0 ? '#eadf7e' : 'red' },
          },
          children: (
            <Link to={`/proforma-invoice/update/${record.pi_num}`}>
              <strong>{text || ''}</strong>
            </Link>
          ),
        }
      },
      // render: (record, text) => (
      //   <Link to={`/proforma-invoice/update/${record.pi_num}`}>{text || ''}</Link>
      // ),
    },

    {
      title: 'PI Qty',
      dataIndex: 'pi_quantity',
      key: 'pi_quantity',
      //   render: (text) => (
      //     <button type="button" className="btn btn-outline-info">
      //       {text || ''}
      //     </button>
      //   ),
    },
    {
      title: 'Buyer Accepted Qty',
      dataIndex: 'buyer_accept_qty',
      key: 'buyer_accept_qty',
    },
    {
      title: 'Rejected Qty',
      dataIndex: 'rejected_quantity',
      key: 'rejected_quantity',
      render: (text, record) => {
        return {
          props: {
            style: { background: '#d271ad' },
          },
          children: <span>{record.pi_quantity - record.buyer_accept_qty}</span>,
        }
      },
      //   render: (text, record) => <span>{record.pi_quantity - record.buyer_accept_qty}</span>,
    },
    {
      title: 'Current SOH',
      dataIndex: 'current_soh',
      key: 'current_soh',
      render: (text, record) => {
        return {
          props: {
            style: { background: record.current_soh > 0 ? '#71d271' : 'red' },
          },
          children: (
            <Link to="/inventory/overview">
              <strong>{text || ''}</strong>
            </Link>
          ),
        }
      },
    },
    {
      title: 'PI Status',
      dataIndex: 'pi_status',
      key: 'pi_status',
    },
    {
      title: 'Buyeer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
    },
    {
      title: 'S.O No.',
      dataIndex: 'so_number',
      key: 'so_number',
      render: (text, record) => {
        return {
          props: {
            style: { background: '#ead2b5' },
          },
          children: <Link to={`/sales-orders/all/view/${record.so_number}`}>{text || ''}</Link>,
        }
      },
    },
    {
      title: 'S.O Qty',
      dataIndex: 'so_quantity',
      key: 'so_quantity',
    },
    {
      title: 'Pending S.O From Buyer',
      dataIndex: 'pending_so_from_buyer',
      key: 'pending_so_from_buyer',
      render: (text, record) => <span>{record.buyer_accept_qty - record.so_quantity}</span>,
    },
    {
      title: 'Dispatched S.O Qty',
      dataIndex: 'dispatch_so_quantity',
      key: 'dispatch_so_quantity',
    },
    {
      title: 'Bal S.O Qty',
      dataIndex: 'bal_so_qty',
      key: 'bal_so_qty',
      render: (text, record) => {
        return {
          props: {
            style: { background: '#a2c0e2' },
          },
          children: <span>{record.so_quantity - record.dispatch_so_quantity}</span>,
        }
      },
    },
    {
      title: 'Production Qty',
      dataIndex: 'production_qty',
      key: 'production_qty',
      render: (text, record) => <span>{record.so_quantity - record.current_soh}</span>,
    },
    {
      title: 'Issued P.O Qty',
      dataIndex: 'issued_po_qty',
      key: 'issued_po_qty',
      render: (text) => {
        return {
          props: {
            style: { background: '#977f35db' },
          },
          children: <Link to="#">{text || ''}</Link>,
        }
      },
    },
    {
      title: 'Bal To be Issued Qty',
      dataIndex: 'bal_issued_qty',
      key: 'bal_issued_qty',
      fixed: 'right',
      render: (text, record) => <span>{record.production_qty - record.issued_po_qty}</span>,
    },
  ]

  const fixedData = [
    {
      pi_num: '1',
      buyer_name: 'amazon',
      pi_quantity: 5000,
      buyer_accept_qty: 4000,
      current_soh: 2000,
      pi_status: 'open',
      so_number: '123XYZ',
      so_quantity: 2000,
      dispatch_so_quantity: 1500,
      production_qty: 2000,
      issued_po_qty: 650,
    },
    {
      pi_num: 'ABS12',
      buyer_name: 'amazon',
      pi_quantity: 3000,
      buyer_accept_qty: 2500,
      current_soh: 1000,
      pi_status: 'open',
      so_number: '6',
      so_quantity: 1000,
      dispatch_so_quantity: 500,
      production_qty: 800,
      issued_po_qty: 600,
    },
  ]

  if (!permissions.includes('readPiSummary')) return <Error403 />
  return (
    <div>
      <Helmet title="PI Summary" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <Table
                  columns={tableColumns}
                  dataSource={fixedData}
                  pagination={false}
                  scroll={{
                    x: 2500,
                    y: 600,
                  }}
                  bordered
                />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(Pisummary))
