import React from 'react'
import { Helmet } from 'react-helmet'
import { Spin, Table } from 'antd'

const RtvSummary = () => {
  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
      width: 100,
    },
    {
      title: 'Buyer Name',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
      width: 100,
    },
    {
      title: 'RO Number',
      dataIndex: 'ro_number',
      key: 'ro_number',
    },
    {
      title: 'PO/SO Number',
      dataIndex: 'po_so_number',
      key: 'po_so_number',
    },
    {
      title: 'RTV WHSE CODE',
      dataIndex: 'rtv_whse_code',
      key: 'rtv_whse_code ',
    },
    {
      title: 'RTV REASON',
      dataIndex: 'rtv_reason',
      key: 'rtv_reason ',
    },
    {
      title: 'RTV Form',
      dataIndex: 'rtv_form',
      key: 'rtv_form',
    },
    {
      title: 'RTV TO ADDRESS',
      dataIndex: 'rtv_to_address',
      key: 'rtv_to_address',
    },
    {
      title: 'RTV QTY',
      dataIndex: 'rtv_qty',
      key: 'rtv_qty',
    },
    {
      title: 'RTV BOXES',
      dataIndex: 'rtv_boxes',
      key: 'rtv_boxes',
    },
    {
      title: 'RTV VALUE',
      dataIndex: 'rtv_value',
      key: 'rtv_value',
    },
    {
      title: 'LOGISTIC PARTNER',
      dataIndex: 'logistic_partner',
      key: 'logistic_partner',
    },

    {
      title: 'POD',
      dataIndex: 'pod',
      key: 'pod',
    },
    {
      title: 'DELIVERY STATUS',
      dataIndex: 'delivery_status',
      key: 'delivery_status',
    },
    {
      title: 'RTV REMARKS',
      dataIndex: 'rtv_remarks',
      key: 'rtv_remarks',
    },
    {
      title: 'GRN NO',
      dataIndex: 'grn_no',
      key: 'grn_no',
    },
    {
      title: 'GRN STATUS',
      dataIndex: 'grn_status',
      key: 'grn_status',
      width: 100,
    },
  ]
  const data = []
  return (
    <div>
      <Helmet title="RTV Summary" />
      <Spin spinning="" tip="Loading..." size="large" className="pt-2">
        <div className="row rtv_summary">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body pt-2">
                <Table
                  columns={tableColumns}
                  dataSource={data}
                  scroll={{ x: 120 }}
                  pagination={false}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                  locale={{
                    emptyText: (
                      <div className="custom-empty-text-parent">
                        <div className="custom-empty-text-child">
                          <i className="fe fe-search" />
                          <h5>No Rtv Summary Found</h5>
                        </div>
                      </div>
                    ),
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

export default RtvSummary
