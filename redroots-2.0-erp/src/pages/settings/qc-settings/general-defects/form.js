import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, InputNumber, Button, Spin, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { AQL_CRITERIA_GENERAL, UPSERT_AQL_CRITERIA_GENERALS } from './queries'

const GeneralDefectForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [generalDefectID, setGeneralDefectID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [defectName, setDefectName] = useState(undefined)
  const [defectNameError, setDefectNameError] = useState(undefined)

  const [criticalThreshold, setCriticalThreshold] = useState(undefined)
  const [criticalThresholdError, setCriticalThresholdError] = useState(undefined)

  const [majorThreshold, setMajorThreshold] = useState(undefined)
  const [majorThresholdError, setMajorThresholdError] = useState(undefined)

  const [minorThreshold, setMinorThreshold] = useState(undefined)
  const [minorThresholdError, setMinorThresholdError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(generalDefectID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertGeneralDefects] = useMutation(UPSERT_AQL_CRITERIA_GENERALS)

  const {
    loading: payTermLoad,
    error: payTermErr,
    data: payTermData,
  } = useQuery(AQL_CRITERIA_GENERAL, { variables: { id: generalDefectID } })

  useEffect(() => {
    if (payTermData && payTermData.aqlCriteriaGeneral) {
      if (payTermData.aqlCriteriaGeneral.defect_name)
        setDefectName(payTermData.aqlCriteriaGeneral.defect_name)
      setCriticalThreshold(payTermData.aqlCriteriaGeneral.critical_threshold || 0)
      setMajorThreshold(payTermData.aqlCriteriaGeneral.major_threshold || 0)
      setMinorThreshold(payTermData.aqlCriteriaGeneral.minor_threshold || 0)
    }
  }, [payTermData])

  useEffect(() => {
    setGeneralDefectID(id)
    setDefectNameError(false)
    setCriticalThresholdError(false)
    setOkText(id ? 'Save' : 'Create')
    setAction(type)
  }, [id, type])

  const showDiscardModal = () => {
    if (changesMadeInForm) setDiscardModalVisible(true)
    else discardChanges()
  }

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) discardChanges()
  }

  const discardChanges = () => {
    setGeneralDefectID(undefined)
    setAction('create')
    setOkText(generalDefectID ? 'Save' : 'Create')
    setDefectName(undefined)
    setDefectNameError(false)
    setCriticalThreshold(undefined)
    setCriticalThresholdError(false)
    setMajorThreshold(undefined)
    setMajorThresholdError(false)
    setMinorThreshold(undefined)
    setMinorThresholdError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setDefectNameError(undefined)

    let isError = false
    if (!defectName) {
      isError = true
      setDefectNameError('Title cannot be empty')
    }
    if (
      criticalThreshold === undefined ||
      criticalThreshold === null ||
      Number(criticalThreshold) < 0
    ) {
      isError = true
      setCriticalThresholdError('Critical Threshold should be a positive number')
    }

    if (majorThreshold === undefined || majorThreshold === null || Number(majorThreshold) < 0) {
      isError = true
      setMajorThresholdError('Major Threshold should be a positive number')
    }

    if (minorThreshold === undefined || minorThreshold === null || Number(minorThreshold) < 0) {
      isError = true
      setMinorThresholdError('Minor Threshold should be a positive number')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertGeneralDefects({
      variables: {
        upsertType: generalDefectID ? 'update' : 'create',
        id: generalDefectID,
        defectName,
        criticalThreshold,
        majorThreshold,
        minorThreshold,
      },
    })
      .then(() => {
        setOkText(generalDefectID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(generalDefectID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving role.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (payTermErr) return `Error occured while fetching data: ${payTermErr.message}`

  return (
    <div>
      <Spin spinning={payTermLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{generalDefectID ? 'Edit' : 'Add'} General Defect</strong>
                </h5>
              </div>

              {action === 'update' && permissions.includes('updateSettings') ? (
                <div className="col-3 pull-right">
                  <Switch
                    checked={editMode}
                    onChange={(checked) => {
                      setEditMode(checked)
                      setDisabled(!checked)
                    }}
                  />
                  &ensp;Edit
                </div>
              ) : null}
            </div>
          </div>

          <div className="card-body">
            <div className="row">
              <div className="col-12">
                <div className="mb-2">
                  Defect Name<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={defectName}
                  onChange={({ target: { value } }) => {
                    setDefectName(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    defectNameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{defectNameError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  Critical Threshold (%)<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  value={criticalThreshold}
                  onChange={(value) => {
                    setCriticalThreshold(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    criticalThresholdError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{criticalThresholdError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  Major Threshold (%)<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  value={majorThreshold}
                  onChange={(value) => {
                    setMajorThreshold(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    majorThresholdError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{majorThresholdError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  Minor Threshold (%)<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  value={minorThreshold}
                  onChange={(value) => {
                    setMinorThreshold(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    minorThresholdError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{minorThresholdError || ''}</div>
              </div>
            </div>

            <div className="row mt-4 mb-4 ml-2">
              {showActionButtons ? (
                <>
                  <Button type="primary" onClick={onSubmit} disabled={disabled}>
                    {okText}
                  </Button>
                  &emsp;
                  <Button danger onClick={showDiscardModal}>
                    Discard
                  </Button>
                  <ConfirmDiscard
                    discardModalVisible={discardModalVisible}
                    discardModalVisibleCallback={discardModalVisibleCallback}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default GeneralDefectForm
