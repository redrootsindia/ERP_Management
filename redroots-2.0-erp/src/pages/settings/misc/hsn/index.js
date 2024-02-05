import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { HSNS } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const HSNs = ({ user: { permissions } }) => {
  const [hsns, setHSNs] = useState([])

  const [hsnID, setHSNID] = useState(undefined)
  const [newHSNIDToLoad, setNewHSNIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading, error, data, refetch } = useQuery(HSNS)

  useEffect(() => {
    if (data && data.hsns && data.hsns.length) setHSNs(data.hsns)
  }, [data])

  const tableColumns = [
    { title: 'HSN Name', dataIndex: 'name', key: 'name' },
    { title: 'SGST (%)', dataIndex: 'sgst', key: 'sgst' },
    { title: 'CGST (%)', dataIndex: 'cgst', key: 'cgst' },
    { title: 'IGST (%)', dataIndex: 'igst', key: 'igst' },
  ]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setHSNID(newHSNIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setHSNID(undefined)
    setNewHSNIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="HSNs" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={hsnID ? 'update' : 'create'}
              id={hsnID}
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
                  <strong>HSNs</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={hsns}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No HSNs Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewHSNIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible) setHSNID(record.id)
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

export default withRouter(connect(mapStateToProps)(HSNs))
