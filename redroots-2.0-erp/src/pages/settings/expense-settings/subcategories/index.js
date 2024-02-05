import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { EXPENSE_SUBCATS } from './queries'
import { EXPENSE_CATS } from '../categories/queries'

const mapStateToProps = ({ user }) => ({ user })

const ExpenseSubcategories = ({ user: { permissions } }) => {
  const [expenseSubcategories, setExpenseSubcategories] = useState([])
  const [categories, setCategories] = useState([])

  const [subCatID, setSubCatID] = useState(undefined)
  const [newSubCatIDToLoad, setNewSubCatIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading: subcatLoad, error: subcatErr, data: subCatData, refetch } = useQuery(
    EXPENSE_SUBCATS,
  )
  const { loading: catLoad, error: catErr, data: catData } = useQuery(EXPENSE_CATS)

  useEffect(() => {
    if (subCatData && subCatData.expenseSubcategories && subCatData.expenseSubcategories.length)
      setExpenseSubcategories(subCatData.expenseSubcategories)
  }, [subCatData])

  useEffect(() => {
    if (!catLoad && catData && catData.expenseCategories && catData.expenseCategories.length)
      setCategories(catData.expenseCategories)
  }, [catData, catLoad])

  const tableColumns = [
    {
      title: 'SubCategory',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'expense_category_id',
      key: 'expense_category_id',
      render: (catID) =>
        catID && Number(catID) !== 0 && categories && categories.length
          ? categories.find(({ id }) => Number(catID) === Number(id)).name
          : null,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (status) =>
        status ? (
          <span>
            <strong>Active</strong>
          </span>
        ) : null,
    },
  ]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setSubCatID(newSubCatIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setSubCatID(undefined)
    setNewSubCatIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`
  if (catErr) return `Error occured while fetching data: ${catErr.message}`

  return (
    <div>
      <Helmet title="Expense Subcategories" />

      <Spin spinning={subcatLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={subCatID ? 'update' : 'create'}
              id={subCatID}
              permissions={permissions}
              categories={categories}
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
                  <strong>EXPENSE SUBCATEGORIES</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={expenseSubcategories}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Sub-Categories Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        console.log(changesMadeInForm, discardModalVisible, 'asd')
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewSubCatIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible) setSubCatID(record.id)
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

export default withRouter(connect(mapStateToProps)(ExpenseSubcategories))
