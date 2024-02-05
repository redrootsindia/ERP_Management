import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { LEAD_TIMES } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const LeadTimes = ({ user: { permissions } }) => {
  const [leadTimes, setLeadTimes] = useState([])

  const [leadTimeID, setLeadTimeID] = useState(undefined)
  const [newLeadTimeIDToLoad, setNewLeadTimeIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading, error, data, refetch } = useQuery(LEAD_TIMES)

  useEffect(() => {
    if (data && data.leadTimes && data.leadTimes.length) setLeadTimes(data.leadTimes)
  }, [data])

  const tableColumns = [
    {
      title: 'Description',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Due in days',
      dataIndex: 'dueInDays',
      key: 'dueInDays',
    },
  ]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setLeadTimeID(newLeadTimeIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setLeadTimeID(undefined)
    setNewLeadTimeIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="Lead Times" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={leadTimeID ? 'update' : 'create'}
              id={leadTimeID}
              permissions={permissions}
              changesMadeInForm={changesMadeInForm}
              setChangesMadeInForm={setChangesMadeInForm}
              discardTableState={discardTableState}
              refetch={refetch}
            />
          </div>

          <div className="col-xl-8 col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>LEAD TIME</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={leadTimes}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Lead Times Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewLeadTimeIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible) setLeadTimeID(record.id)
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

export default withRouter(connect(mapStateToProps)(LeadTimes))
