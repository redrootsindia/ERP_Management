import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { VENDOR_TYPES } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const VendorTypesI = ({ user: { permissions } }) => {
  const [VendorTypes, setVendorTypes] = useState([])

  const [vendorTypeID, setVendorTypeID] = useState(undefined)
  const [newVendorTypeIDToLoad, setNewVendorTypeIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading, error, data, refetch } = useQuery(VENDOR_TYPES)
  useEffect(() => {
    if (data && data.vendorTypes && data.vendorTypes.length) setVendorTypes(data.vendorTypes)
  }, [data])

  const tableColumns = [{ title: 'Name', dataIndex: 'type', key: 'type' }]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setVendorTypeID(newVendorTypeIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setVendorTypeID(undefined)
    setNewVendorTypeIDToLoad(undefined)
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
              type={vendorTypeID ? 'update' : 'create'}
              id={vendorTypeID}
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
                  <strong>VendorTypes</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={VendorTypes}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>VendorTypes</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewVendorTypeIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible) setVendorTypeID(record.id)
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

export default withRouter(connect(mapStateToProps)(VendorTypesI))
