import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { ATTRIBUTE_VALUES } from './queries'
import { ATTRIBUTES } from '../attributes/queries'

const mapStateToProps = ({ user }) => ({ user })

const AttributeValues = ({ user: { permissions } }) => {
  const [attributeValues, setAttributeValues] = useState([])
  const [attributes, setAttributes] = useState([])

  const [attributeValueID, setAttributeValueID] = useState(undefined)
  const [newAttributeValueIDToLoad, setNewAttributeValueIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const {
    loading: attributeValueLoad,
    error: attributeValueErr,
    data: attributeValueData,
    refetch,
  } = useQuery(ATTRIBUTE_VALUES)
  const { loading: attributeLoad, error: attributeErr, data: attributeData } = useQuery(ATTRIBUTES)

  useEffect(() => {
    if (
      attributeValueData &&
      attributeValueData.attributeValues &&
      attributeValueData.attributeValues.length
    )
      setAttributeValues(attributeValueData.attributeValues)
  }, [attributeValueData])

  useEffect(() => {
    if (
      !attributeLoad &&
      attributeData &&
      attributeData.attributes &&
      attributeData.attributes.length
    )
      setAttributes(attributeData.attributes)
  }, [attributeData, attributeLoad])

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Attribute',
      dataIndex: 'attribute_id',
      key: 'attribute_id',
      render: (attributeID) =>
        attributeID && Number(attributeID) !== 0 && attributes && attributes.length
          ? attributes.find(({ id }) => Number(attributeID) === Number(id)).name
          : null,
    },
  ]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setAttributeValueID(newAttributeValueIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setAttributeValueID(undefined)
    setNewAttributeValueIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (attributeValueErr) return `Error occured while fetching data: ${attributeValueErr.message}`
  if (attributeErr) return `Error occured while fetching data: ${attributeErr.message}`

  return (
    <div>
      <Helmet title="Product Subattributes" />

      <Spin spinning={attributeValueLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={attributeValueID ? 'update' : 'create'}
              id={attributeValueID}
              permissions={permissions}
              attributes={attributes}
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
                  <strong>ATTRIBUTE VALUES</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={attributeValues}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Attribute Values Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewAttributeValueIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible)
                          setAttributeValueID(record.id)
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

export default withRouter(connect(mapStateToProps)(AttributeValues))
