import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { BUYER_GROUP_WAREHOUSES } from './queries'
import { BUYER_GROUPS } from '../buyer-groups/queries'

const mapStateToProps = ({ user }) => ({ user })

const BuyerGroupWarehouses = ({ user: { permissions } }) => {
  const [buyerGroupWarehouses, setBuyerGroupWarehouses] = useState([])
  const [buyerGroups, setBuyerGroups] = useState([])

  const [warehouseID, setWarehouseID] = useState(undefined)
  const [newWarehouseIDToLoad, setNewWarehouseIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading: bgWHLoad, error: bgWHErr, data: bgWHData, refetch } = useQuery(
    BUYER_GROUP_WAREHOUSES,
  )
  const { loading: bgLoad, error: bgErr, data: bgData } = useQuery(BUYER_GROUPS)

  useEffect(() => {
    if (bgWHData && bgWHData.buyerGroupWarehouses && bgWHData.buyerGroupWarehouses.length)
      setBuyerGroupWarehouses(bgWHData.buyerGroupWarehouses)
  }, [bgWHData])

  useEffect(() => {
    if (!bgLoad && bgData && bgData.buyerGroups && bgData.buyerGroups.length)
      setBuyerGroups(bgData.buyerGroups)
  }, [bgData, bgLoad])

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Buyer Group',
      dataIndex: 'buyer_group_id',
      key: 'buyer_group_id',
      render: (bgID) =>
        bgID && Number(bgID) !== 0 && buyerGroups && buyerGroups.length
          ? buyerGroups.find(({ id }) => Number(bgID) === Number(id)).name
          : null,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
  ]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setWarehouseID(newWarehouseIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setWarehouseID(undefined)
    setNewWarehouseIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (bgWHErr) return `Error occured while fetching data: ${bgWHErr.message}`
  if (bgErr) return `Error occured while fetching data: ${bgErr.message}`

  return (
    <div>
      <Helmet title="Buyer Warehouses" />

      <Spin spinning={bgWHLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={warehouseID ? 'update' : 'create'}
              id={warehouseID}
              permissions={permissions}
              buyerGroups={buyerGroups}
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
                  <strong>BUYER WAREHOUSES</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={buyerGroupWarehouses}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Buyer Warehouses Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewWarehouseIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible) setWarehouseID(record.id)
                        // history.push(`/accounts/vendor-settings/payment-terms/update/${record.id}`),
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

export default withRouter(connect(mapStateToProps)(BuyerGroupWarehouses))
