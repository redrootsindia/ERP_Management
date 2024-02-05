import React, { useState, useEffect } from 'react'
import { withRouter, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin, Image } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import MATERIAL_LEDGER_REPORT from './queries'

const mapStateToProps = ({ user }) => ({ user })

const MaterialBatch = ({ user: { permissions } }) => {
  const { id, batchID } = useParams()

  const [materialID] = useState(id)

  const [materialLedgerReport, setMaterialLedgerReport] = useState([])
  const [materialLedgerReportName, setMaterialLedgerReportName] = useState(undefined)
  const [imagePrev, setImagePrev] = useState(null)
  const {
    loading: MLRLoad,
    error: MLRErr,
    data: MLRData,
  } = useQuery(MATERIAL_LEDGER_REPORT, {
    variables: { materialID, batchID },
  })

  useEffect(() => {
    if (MLRData && MLRData.materialLedgerReport) {
      const { material_stocks, material_data } = MLRData.materialLedgerReport
      console.log('material_stocks', material_stocks)
      let newarray = []
      if (material_data && material_data.image) setImagePrev(material_data.image)
      if (material_data && material_data.material_name)
        setMaterialLedgerReportName(material_data.material_name.toUpperCase())

      let count = 0
      // eslint-disable-next-line no-plusplus
      for (let i = material_stocks.length - 1; i >= 0; i--) {
        console.log('i', i)
        console.log('material_stocks[i]', material_stocks[i])
        if (material_stocks[i].type === 'inward') {
          count += material_stocks[i].quantity
        } else {
          count -= material_stocks[i].quantity
        }

        newarray.push({ ...material_stocks[i], id: i + 1, balance: count })
      }
      console.log('before', newarray)
      newarray = newarray
        .slice()
        .reverse()
        .map((e) => e)
      setMaterialLedgerReport(newarray)
    } else {
      setMaterialLedgerReport([])
    }
  }, [MLRData])

  const tableColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(Number(text)).format('Do MMM YYYY'),
    },
    {
      title: 'Location',
      dataIndex: 'warehouse',
      key: 'warehouse',
      sorter: (a, b) => a.warehouse.localeCompare(b.warehouse),
    },
    {
      title: 'Inward',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => (record.type === 'inward' ? record.quantity : 0),
      onCell: ({ quantity, type }) => ({
        className: `table-cellColor-${quantity && type === 'inward' ? 'green' : ''}`,
      }),
    },
    {
      title: 'Booked',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => (record.type === 'booked' ? record.quantity : 0),
    },
    {
      title: 'Outward',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => (record.type === 'dispatch' ? record.quantity : 0),
    },
    {
      title: 'Stock Written Off',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => (record.type === 'write-off' ? record.quantity : 0),
      onCell: ({ quantity, type }) => ({
        className: `table-cellColor-${quantity && type === 'write-off' ? 'magenta' : ''}`,
      }),
    },
    {
      title: 'Against Purchase Order ',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      sorter: (a, b) => a.purchase_order_id - b.purchase_order_id,
      render: (text, record) => record.purchase_order_id || '-',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (text, record) => {
        if (Number.isInteger(record.balance)) {
          return <strong>{record.balance}</strong>
        }
        return <strong>{record.balance.toFixed(2)}</strong>
      },
    },
  ]

  if (!permissions.includes('readMaterialReport')) return <Error403 />
  if (MLRErr) return `Error occured while fetching data: ${MLRErr.message}`

  return (
    <div>
      <Helmet title="Ledger Report" />

      <Spin spinning={MLRLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <div className="row">
                  <div className="col-lg-11">
                    <h5 className="mb-4">
                      <strong>
                        MATERIAL LEDGER REPORT - {materialLedgerReportName}{' '}
                        {batchID && `(BATCH #${batchID})`}
                      </strong>
                    </h5>
                  </div>
                  <div className="col-lg-1">
                    <div className="text-center mr-1">
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
                    dataSource={materialLedgerReport}
                    pagination={{
                      defaultPageSize: 20,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '30'],
                    }}
                    rowKey={(record) => String(record.key)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Ledger Report Found</h5>
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

export default withRouter(connect(mapStateToProps)(MaterialBatch))
