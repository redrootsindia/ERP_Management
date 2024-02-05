import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { ROLES } from './queries'

const tableColumns = [{ title: 'Role', dataIndex: 'title', key: 'title' }]

const mapStateToProps = ({ user }) => ({ user })

const Roles = ({ user: { permissions } }) => {
  const [roleID, setRoleID] = useState(undefined)
  const [newRoleIDToLoad, setNewRoleIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [roles, setRoles] = useState([])

  const { loading, error, data, refetch } = useQuery(ROLES)

  useEffect(() => {
    if (data && data.roles && data.roles.length) setRoles(data.roles)
  }, [data])

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setRoleID(newRoleIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setRoleID(undefined)
    setNewRoleIDToLoad(undefined)
  }

  if (!permissions.includes('readRole')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="Roles" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-9 col-lg-12">
            <Form
              type={roleID ? 'update' : 'create'}
              id={roleID}
              permissions={permissions}
              changesMadeInForm={changesMadeInForm}
              setChangesMadeInForm={setChangesMadeInForm}
              discardTableState={discardTableState}
              refetch={refetch}
            />
          </div>

          <div className="col-xl-3 col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>ROLES</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={roles}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Roles Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewRoleIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible) setRoleID(record.id)
                      },
                    })}
                  />
                  <ConfirmDiscard
                    discardModalVisible={discardModalVisible}
                    discardModalVisibleCallback={discardModalVisibleCallback}
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

export default withRouter(connect(mapStateToProps)(Roles))
