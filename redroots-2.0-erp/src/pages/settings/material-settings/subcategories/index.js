import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { MATERIAL_SUBCATS } from './queries'
import { MATERIAL_CATS } from '../categories/queries'
import { HSNS } from '../../misc/hsn/queries'

const mapStateToProps = ({ user }) => ({ user })

const MaterialSubcategories = ({ user: { permissions } }) => {
  const [materialSubcategories, setMaterialSubcategories] = useState([])
  const [categories, setCategories] = useState([])
  const [hsnList, setHSNList] = useState(undefined)

  const [subCatID, setSubCatID] = useState(undefined)
  const [newSubCatIDToLoad, setNewSubCatIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading: subcatLoad, error: subcatErr, data: subCatData, refetch } = useQuery(
    MATERIAL_SUBCATS,
  )
  const { loading: catLoad, error: catErr, data: catData } = useQuery(MATERIAL_CATS)
  const { loading: hsnLoad, error: hsnErr, data: hsnData } = useQuery(HSNS)

  useEffect(() => {
    if (subCatData && subCatData.materialSubcategories && subCatData.materialSubcategories.length)
      setMaterialSubcategories(subCatData.materialSubcategories)
  }, [subCatData])

  useEffect(() => {
    if (!catLoad && catData && catData.materialCategories && catData.materialCategories.length)
      setCategories(catData.materialCategories)
  }, [catData, catLoad])

  useEffect(() => {
    if (!hsnLoad && hsnData && hsnData.hsns && hsnData.hsns.length) setHSNList(hsnData.hsns)
  }, [hsnData, hsnLoad])

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Parent Category',
      dataIndex: 'material_category_id',
      key: 'material_category_id',
      render: (catID) =>
        catID && Number(catID) !== 0 && categories && categories.length
          ? categories.find(({ id }) => Number(catID) === Number(id)).name
          : null,
    },
    {
      title: 'Panna',
      dataIndex: 'panna',
      key: 'panna',
    },
    {
      title: 'HSN',
      dataIndex: 'hsn_id',
      key: 'hsn_id',
      render: (hsnID) =>
        hsnID && Number(hsnID) !== 0 && hsnList && hsnList.length
          ? hsnList.find(({ id }) => Number(hsnID) === Number(id)).name
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
  if (hsnErr) return `Error occured while fetching data: ${hsnErr.message}`

  return (
    <div>
      <Helmet title="Material Subcategories" />

      <Spin spinning={subcatLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={subCatID ? 'update' : 'create'}
              id={subCatID}
              permissions={permissions}
              categories={categories}
              hsnList={hsnList}
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
                  <strong>MATERIAL SUBCATEGORIES</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={materialSubcategories}
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

export default withRouter(connect(mapStateToProps)(MaterialSubcategories))
