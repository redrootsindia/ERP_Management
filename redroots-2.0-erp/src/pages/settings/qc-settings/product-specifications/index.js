import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { PRODUCT_SPECIFICATIONS } from './queries'

const mapStateToProps = ({ user }) => ({ user })
const ProductSpecificationList = ({ user: { permissions } }) => {
  const [productSpecificationsList, setProductSpecificationsList] = useState([])

  const [productSpecificationID, setProductSpecificationID] = useState(undefined)
  const [newProductSpecificationIDToLoad, setNewProductSpecificationIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading, error, data, refetch } = useQuery(PRODUCT_SPECIFICATIONS)

  useEffect(() => {
    if (data && data.productSpecificationNames && data.productSpecificationNames.length)
      setProductSpecificationsList(data.productSpecificationNames)
  }, [data])

  const tableColumns = [{ title: 'Specification', dataIndex: 'specs_name', key: 'specs_name' }]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setProductSpecificationID(newProductSpecificationIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setProductSpecificationID(undefined)
    setNewProductSpecificationIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="Product Specifications" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={productSpecificationID ? 'update' : 'create'}
              id={productSpecificationID}
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
                  <strong>Product Specifications</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={productSpecificationsList}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Product Specifications Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewProductSpecificationIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible)
                          setProductSpecificationID(record.id)
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

export default withRouter(connect(mapStateToProps)(ProductSpecificationList))
