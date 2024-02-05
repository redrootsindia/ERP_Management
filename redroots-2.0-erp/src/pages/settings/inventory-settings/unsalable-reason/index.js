import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { UNSALABLE_REASONS } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const UnsalableReasonI = ({ user: { permissions } }) => {
  const [unsalableReasons, setunsalableReasons] = useState([])

  const [unsalableReasonID, setunsalableReasonID] = useState(undefined)
  const [newunsalableReasonIDToLoad, setNewunsalableReasonIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading, error, data, refetch } = useQuery(UNSALABLE_REASONS)
  useEffect(() => {
    if (data) setunsalableReasons(data.unsalableReasons)
  }, [data])

  const tableColumns = [{ title: 'Name', dataIndex: 'name', key: 'name  ' }]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setunsalableReasonID(newunsalableReasonIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setunsalableReasonID(undefined)
    setNewunsalableReasonIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="VendorTypes" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={unsalableReasonID ? 'update' : 'create'}
              id={unsalableReasonID}
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
                  <strong>Unsalable Reason</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={unsalableReasons}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>Unsalable reason</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewunsalableReasonIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible)
                          setunsalableReasonID(record.id)
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

export default withRouter(connect(mapStateToProps)(UnsalableReasonI))
