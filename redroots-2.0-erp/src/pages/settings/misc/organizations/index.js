import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Button, Table, Spin, Switch, notification } from 'antd'
import Error403 from 'components/Errors/403'
import { ORGANIZATIONS, CHANGE_STATUS } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const Organizations = ({ user: { permissions } }) => {
  const [organizations, setOrganizations] = useState([])

  const [changeStatus] = useMutation(CHANGE_STATUS)
  const { loading: organizationLoad, error: organizationErr, data: organizationData } = useQuery(
    ORGANIZATIONS,
  )

  useEffect(() => {
    if (
      organizationData &&
      organizationData.organizations &&
      organizationData.organizations.length
    ) {
      setOrganizations(organizationData.organizations)
    } else {
      setOrganizations([])
    }
  }, [organizationData])

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/settings/misc/organizations/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'e-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) =>
        permissions.includes('updateSettings') ? (
          <Switch
            defaultChecked={active}
            onChange={(checked) =>
              changeStatus({ variables: { id: record.id, status: checked } })
                .then(() =>
                  notification.success({
                    description: (
                      <span>
                        Status of <strong>{record.name}</strong> changed successfully
                      </span>
                    ),
                  }),
                )
                .catch((err) => {
                  notification.error({
                    message: 'Error occured while changing status.',
                    description: err.message || 'Please contact system administrator.',
                  })
                })
            }
            disabled={!permissions.includes('updateSettings')}
          />
        ) : active ? (
          'Yes'
        ) : (
          'No'
        ),
    },
  ]

  if (!permissions.includes('readSettings')) return <Error403 />
  if (organizationErr) return `Error occured while fetching data: ${organizationErr.message}`

  return (
    <div>
      <Helmet title="Organizations" />

      <Spin spinning={organizationLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>ORGANIZATIONS</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createSettings') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/settings/misc/organizations/create">
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
                    dataSource={organizations}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Organizations Found</h5>
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

export default withRouter(connect(mapStateToProps)(Organizations))
