import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { PRODUCT_SUBCATS } from './queries'
import { PRODUCT_CATS } from '../categories/queries'

const mapStateToProps = ({ user }) => ({ user })

const ProductSubcategories = ({ user: { permissions } }) => {
  const [productSubcategories, setProductSubcategories] = useState([])
  const [categories, setCategories] = useState([])

  const [subCatID, setSubCatID] = useState(undefined)
  const [newSubCatIDToLoad, setNewSubCatIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading: subcatLoad, error: subcatErr, data: subCatData, refetch } = useQuery(
    PRODUCT_SUBCATS,
  )
  const { loading: catLoad, error: catErr, data: catData } = useQuery(PRODUCT_CATS)

  useEffect(() => {
    if (subCatData && subCatData.productSubcategories && subCatData.productSubcategories.length)
      setProductSubcategories(subCatData.productSubcategories)
  }, [subCatData])

  useEffect(() => {
    if (!catLoad && catData && catData.productCategories && catData.productCategories.length)
      setCategories(catData.productCategories)
  }, [catData, catLoad])

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Parent Category',
      dataIndex: 'product_category_id',
      key: 'product_category_id',
      render: (catID) =>
        catID && Number(catID) !== 0 && categories && categories.length
          ? categories.find(({ id }) => Number(catID) === Number(id)).name
          : null,
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
      <Helmet title="Product Subcategories" />

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
                  <strong>PRODUCT SUBCATEGORIES</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={productSubcategories}
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
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewSubCatIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible) setSubCatID(record.id)
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

export default withRouter(connect(mapStateToProps)(ProductSubcategories))
