import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Button, Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import { AQLMAINS } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const AQLLevels = ({ user: { permissions } }) => {
  const [aqlMains, setAQLMains] = useState([])

  const { loading: aqlMainsLoad, error: aqlMainsErr, data: aqlMainsData } = useQuery(AQLMAINS)

  useEffect(() => {
    if (aqlMainsData && aqlMainsData.aqlMains && aqlMainsData.aqlMains.length) {
      setAQLMains(aqlMainsData.aqlMains)
    } else {
      setAQLMains([])
    }
  }, [aqlMainsData])

  const tableColumns = [
    {
      title: 'AQL Level',
      dataIndex: 'level_name',
      key: 'level_name',
      render: (text, record) => (
        <Link to={`/settings/qc-settings/aql-levels/update/${record.id}`}>{text}</Link>
      ),
    },
  ]

  if (!permissions.includes('readSettings')) return <Error403 />
  if (aqlMainsErr) return `Error occured while fetching data: ${aqlMainsErr.message}`

  return (
    <div>
      <Helmet title="Organizations" />

      <Spin spinning={aqlMainsLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>AQL Levels</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createSettings') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/settings/qc-settings/aql-levels/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={aqlMains}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No AQL Levels Found</h5>
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

export default withRouter(connect(mapStateToProps)(AQLLevels))
