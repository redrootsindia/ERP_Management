import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { useQuery } from '@apollo/client'
import { Table, Tooltip, Button, Spin, Pagination, Tag, Popconfirm } from 'antd'
import moment from 'moment'
import { capitalize } from 'lodash'
import {
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import { RTV_LIST } from './queries'
import GRNDownload from './grnDownload'

const mapStateToProps = ({ user }) => ({ user })

const RTVs = ({ user: { permissions } }) => {
  const tagColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default'
      case 'partial':
        return 'purple'
      case 'completed':
        return 'success'
      case 'closed':
        return 'error'
      default:
        return 'default'
    }
  }

  const [rtvs, setRTVs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  const { loading, error, data } = useQuery(RTV_LIST, { variables: { limit, offset } })

  useEffect(() => {
    if (!loading && data && data.rtvs && data.rtvs.rows && data.rtvs.rows.length) {
      setRTVs(data.rtvs.rows)
      setRecordCount(data.rtvs.count)
    }
  }, [data, loading])

  const tableColumns = [
    {
      title: 'RTV Name / ID',
      dataIndex: 'rtv_name',
      key: 'rtv_name',
    },
    {
      title: 'Return From (Buyer)',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
    },
    {
      title: 'Against Sales Order',
      dataIndex: 'sales_order_names',
      key: 'sales_order_names',
      render: (text, record) =>
        text ? record.sales_order_names.map((soName, i) => <Tag key={i}>{soName}</Tag>) : '',
    },
    {
      title: 'Return Date',
      dataIndex: 'received_on',
      key: 'received_on',
      width: '10%',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Total Return Qty.',
      dataIndex: 'total_return_quantity',
      key: 'total_return_quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '16%',
      render: (status, { in_progress }) => (
        <Tag
          style={{ fontSize: '1rem', padding: '4px' }}
          icon={
            in_progress ? (
              <SyncOutlined spin />
            ) : status === 'pending' ? (
              <ClockCircleOutlined />
            ) : status === 'partial' ? (
              <ExclamationCircleOutlined />
            ) : status === 'completed' ? (
              <CheckCircleOutlined />
            ) : status === 'closed' ? (
              <MinusCircleOutlined />
            ) : null
          }
          color={in_progress ? 'processing' : tagColor(status)}
        >
          {in_progress
            ? 'Processing'
            : status === 'partial'
            ? 'Partially Completed'
            : capitalize(status)}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'x',
      sort: false,
      filter: false,
      type: 'number',
      render: (text, record) => (
        <div className="row">
          <div className="col-lg-3 col-sm-4 d-none">
            <Tooltip title="Put items on shelves">
              <Button
                type="primary"
                disabled={!(record.status === 0 || record.status === 4)}
                // onClick={() =>
                //   updatePutAwayStatus({
                //     variables: {
                //       mainTableId: record.id,
                //       status: 1,
                //       type: 4,
                //     },
                //   })
                // }
              >
                <Link to={`/inventory/rtv/putaway/${record.id}}`}>Put Away</Link>
              </Button>
            </Tooltip>
          </div>
          <div className="col-lg-3 col-sm-4">
            <Link to={`/inventory/rtv/scan-rtv/form/${record.id}`}>
              <Button
                type="primary"
                // disabled={in_progress || (status !== 'pending' && status !== 'partial')}
                // onClick={() =>
                //   changeProcessingState({
                //     variables: { id, in_progress: true },
                //   }).catch((err) => console.log('Error occured: ', err))
                // }
              >
                {record.status === 'partial' ? 'Resume' : 'Put Away'}
              </Button>
            </Link>
          </div>
          <div className="col-lg-2 col-sm-4">
            <Popconfirm
              title="Sure to 'Force Close' ?"
              // onConfirm={() =>
              //   updatePutAwayStatus({
              //     variables: {
              //       mainTableId: record.id,
              //       status: 3,
              //       type: 4,
              //     },
              //   })
              // }
            >
              <Button type="primary" disabled={!(record.status === 0 || record.status === 4)}>
                Close
              </Button>
            </Popconfirm>
          </div>
          {record.status === 2 || record.status === 3 ? (
            <div key="3" className="col-lg-2">
              <Tooltip title="Edit quantities put away on shelves">
                <Button type="primary" disabled={!(record.status === 2 || record.status === 3)}>
                  <Link to={`/inventory/rtv/non-scanner-edit/${record.id}`}>Edit</Link>
                </Button>
              </Tooltip>
            </div>
          ) : null}

          <div className="col-lg-3">
            <Link to={`/inventory/rtv/update/${record.id}`}>
              <Button
                type="primary"
                // disabled={record.status !== 'pending'}
              >
                View / Edit
              </Button>
            </Link>
          </div>
          <div className="col-lg-3">
            <GRNDownload id={record.id} />
          </div>
        </div>
      ),
    },
    // {
    //   title: '',
    //   key: 'x',
    //   sort: false,
    //   filter: false,
    //   type: 'number',
    //   render: (text, record) => (
    //     <div className="row">
    //       <div className="col-lg-3">
    //         <GRNDownload id={record.id} />
    //       </div>
    //     </div>
    //   ),
    // },
  ]

  if (!permissions.includes('readRTV')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="RTVs" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>RTVs</strong>
                </h5>
                {permissions.includes('createRTV') ? (
                  <Link to="/inventory/rtv/create">
                    <Button type="primary">Create</Button>
                  </Link>
                ) : null}
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={rtvs}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No RTVs Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                  />
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

export default withRouter(connect(mapStateToProps)(RTVs))

/**
import React from "react";
import Page from "components/LayoutComponents/Page";
import Helmet from "react-helmet";
import { Query, Mutation } from "react-apollo";
import { getAllRTVs } from "../../../Query/WarehouseManagement/rtv";
import { updatePutAwayStatusMutation } from "Query/WarehouseManagement/putAwayQueries";
import RTVList from "./RTVList";

class RTVPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static defaultProps = {
    // abcd: { name: "RTV", path: "/inventory/putaway" },
    // pathName: "PAway",
    roles: ["agent", "administrator"],
    accessRights: ["isViewDataValidation"]
  };

  render() {
    return (
      <Page {...this.props}>
        <Helmet title="RTV" />
        <Query query={getAllRTVs}>
          {({ loading: allRTVLoad, error: allRTVErr, data: allRTVData }) => (
            <Mutation mutation={updatePutAwayStatusMutation}>
              {updatePutAwayStatus => {
                if (allRTVLoad) return "Loading....";
                if (allRTVErr) return `${allRTVErr.message}`;

                // console.log("allRTVData: ", allRTVData.getAllRTVs);

                return (
                  <RTVList
                    tableData={allRTVData.getAllRTVs}
                    updatePutAwayStatus={updatePutAwayStatus}
                  />
                );
              }}
            </Mutation>
          )}
        </Query>
      </Page>
    );
  }
}
export default RTVPage;
*/
