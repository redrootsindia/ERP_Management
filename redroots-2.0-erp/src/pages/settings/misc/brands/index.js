import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { BRANDS } from './queries'
import { ORGANIZATIONS } from '../organizations/queries'

const mapStateToProps = ({ user }) => ({ user })

const Brand = ({ user: { permissions } }) => {
  const [brands, setBrand] = useState([])
  const [organizations, setOrganizations] = useState([])

  const [brandID, setBrandID] = useState(undefined)
  const [newBrandIDToLoad, setNewBrandIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading: brandLoad, error: brandErr, data: brandData, refetch } = useQuery(BRANDS)
  const { loading: organizationLoad, error: organizationErr, data: organizationData } = useQuery(
    ORGANIZATIONS,
  )

  useEffect(() => {
    if (brandData && brandData.brands && brandData.brands.length) setBrand(brandData.brands)
  }, [brandData])

  useEffect(() => {
    if (
      !organizationLoad &&
      organizationData &&
      organizationData.organizations &&
      organizationData.organizations.length
    )
      setOrganizations(organizationData.organizations)
  }, [organizationData, organizationLoad])

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Organization',
      dataIndex: 'organization_id',
      key: 'organization_id',
      render: (organizationID) =>
        organizationID && Number(organizationID) !== 0 && organizations && organizations.length
          ? organizations.find(({ id }) => Number(organizationID) === Number(id)).name
          : null,
    },
  ]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setBrandID(newBrandIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setBrandID(undefined)
    setNewBrandIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (organizationErr) return `Error occured while fetching data: ${organizationErr.message}`

  return (
    <div>
      <Helmet title="Brands" />

      <Spin spinning={brandLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={brandID ? 'update' : 'create'}
              id={brandID}
              permissions={permissions}
              organizations={organizations}
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
                  <strong>BRANDS</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={brands}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Brands Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewBrandIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible) setBrandID(record.id)
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

export default withRouter(connect(mapStateToProps)(Brand))
