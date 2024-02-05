import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import Form from './form'
import { AQL_CRITERIA_GENERALS } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const GeneralDefects = ({ user: { permissions } }) => {
  const [aqlCriteriaGenerals, setAQLCriteriaGenerals] = useState([])

  const [generalDefectID, setGeneralDefectID] = useState(undefined)
  const [newGeneralDefectIDToLoad, setNewGeneralDefectIDToLoad] = useState(undefined)
  const [changesMadeInForm, setChangesMadeInForm] = useState(false)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const { loading, error, data, refetch } = useQuery(AQL_CRITERIA_GENERALS)

  useEffect(() => {
    if (data && data.aqlCriteriaGenerals && data.aqlCriteriaGenerals.length)
      setAQLCriteriaGenerals(data.aqlCriteriaGenerals)
  }, [data])

  const tableColumns = [
    {
      title: 'Defect Name',
      dataIndex: 'defect_name',
      key: 'defect_name',
    },
    {
      title: 'Critical Threshold (%)',
      dataIndex: 'critical_threshold',
      key: 'critical_threshold',
    },
    {
      title: 'Major Threshold (%)',
      dataIndex: 'major_threshold',
      key: 'major_threshold',
    },
    {
      title: 'Minor Threshold (%)',
      dataIndex: 'minor_threshold',
      key: 'minor_threshold',
    },
  ]

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) {
      setGeneralDefectID(newGeneralDefectIDToLoad)
      setChangesMadeInForm(false)
    }
  }

  const discardTableState = () => {
    setGeneralDefectID(undefined)
    setNewGeneralDefectIDToLoad(undefined)
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="General Defects" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-xl-4 col-lg-12">
            <Form
              type={generalDefectID ? 'update' : 'create'}
              id={generalDefectID}
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
                  <strong>GENERAL DEFECTS</strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={aqlCriteriaGenerals}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No General Defects Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => {
                        if (changesMadeInForm) {
                          setDiscardModalVisible(true)
                          setNewGeneralDefectIDToLoad(record.id)
                        }
                        if (!changesMadeInForm && !discardModalVisible)
                          setGeneralDefectID(record.id)
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

export default withRouter(connect(mapStateToProps)(GeneralDefects))
