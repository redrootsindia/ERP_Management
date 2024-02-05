import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { RETURN_REASONS } from './queries'
import { RETURN_REASON_CATEGORIES } from '../return-reason-categories/queries'

const mapStateToProps = ({ user }) => ({ user })

const ReturnReasonI = ({ user: { permissions } }) => {
  const [returnReasons, setreturnReasons] = useState([])
  const [returnReasonCategories, setreturnReasonCategories] = useState([])

  const [returnReasonsID, setreturnReasonsID] = useState(undefined)
  const [newreturnReasonsIDToLoad, setNewreturnReasonsIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const {
    loading: returnReasonsLoad,
    error: returnReasonsErr,
    data: returnReasonsData,
    refetch,
  } = useQuery(RETURN_REASONS)
  const {
    loading: returnReasonCategoriesLoad,
    error: returnReasonCategoriesErr,
    data: returnReasonCategoriesData,
  } = useQuery(RETURN_REASON_CATEGORIES)

  useEffect(() => {
    if (returnReasonsData && returnReasonsData.returnReasons.length) {
      setreturnReasons(returnReasonsData.returnReasons)
    }
  }, [returnReasonsData])

  useEffect(() => {
    if (!returnReasonCategoriesLoad && returnReasonCategoriesData)
      setreturnReasonCategories(returnReasonCategoriesData.returnReasonCategories)
  }, [returnReasonCategoriesData, returnReasonCategoriesLoad])

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Return Categories',
      dataIndex: 'return_reason_category_id',
      key: 'return_reason_category_id',
      render: (returnReasonCategoryID) => {
        return returnReasonCategoryID &&
          Number(returnReasonCategoryID) !== 0 &&
          returnReasonCategories &&
          returnReasonCategories.length
          ? returnReasonCategories.find(({ id }) => Number(returnReasonCategoryID) === Number(id))
              .name
          : null
      },
    },
  ]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setreturnReasonsID(newreturnReasonsIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setreturnReasonsID(undefined)
    setNewreturnReasonsIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (returnReasonsErr) return `Error occured while fetching data: ${returnReasonsErr.message}`
  if (returnReasonCategoriesErr)
    return `Error occured while fetching data: ${returnReasonCategoriesErr.message}`

  return (
    <div>
      <Helmet title="Brands" />

      <Spin spinning={returnReasonsLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={returnReasonsID ? 'update' : 'create'}
              id={returnReasonsID}
              permissions={permissions}
              returnCategories={returnReasonCategories}
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
                  <strong>Return Reasons </strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={returnReasons}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Return reasons Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewreturnReasonsIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible)
                          setreturnReasonsID(record.id)
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

export default withRouter(connect(mapStateToProps)(ReturnReasonI))
