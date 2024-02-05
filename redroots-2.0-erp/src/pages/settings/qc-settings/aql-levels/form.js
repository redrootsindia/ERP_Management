import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import {
  Input,
  InputNumber,
  Button,
  Spin,
  Switch,
  Select,
  notification,
  Table,
  Image,
  Popconfirm,
  DatePicker,
  Modal,
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import ImageUpload from 'components/ImageUpload'
import Error403 from 'components/Errors/403'
import { AQLMAIN, UPSERT_AQLMAIN } from './queries'

const { Option } = Select

/* eslint no-unused-vars: "off" */
const mapStateToProps = ({ user }) => ({ user })

const AQLLevelForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [levelName, setLevelName] = useState(undefined)
  const [levelNameError, setLevelNameError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertAQLMain] = useMutation(UPSERT_AQLMAIN)
  const { loading: aqlLevelLoad, error: aqlLevelErr, data: aqlLevelData } = useQuery(AQLMAIN, {
    variables: { id },
  })

  const [tableData, setTableData] = useState([
    {
      key: 0,
      batch_size_min: 0,
      batch_size_max: 0,
      sample_size: 0,
      pass_size: 0,
      fail_size: 0,
    },
  ])
  const [tableDataError, setTableDataError] = useState(false)

  const columns = [
    {
      title: 'Min. batch-size',
      dataIndex: 'batch_size_min',
      key: 'batch_size_min',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.batch_size_min
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: (
            <InputNumber
              value={record.batch_size_min}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.batch_size_min = value
                  }
                })
                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
            />
          ),
        }
      },
    },
    {
      title: 'Max. batch-size',
      dataIndex: 'batch_size_max',
      key: 'batch_size_max',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.batch_size_max
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: (
            <InputNumber
              value={record.batch_size_max}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.batch_size_max = value
                  }
                })
                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
            />
          ),
        }
      },
    },
    {
      title: 'Sample Size',
      dataIndex: 'sample_size',
      key: 'sample_size',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.sample_size
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: (
            <InputNumber
              value={record.sample_size}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.sample_size = value
                  }
                })
                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
            />
          ),
        }
      },
    },
    {
      title: 'Pass Size',
      dataIndex: 'pass_size',
      key: 'pass_size',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.pass_size
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: (
            <InputNumber
              value={record.pass_size}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.pass_size = value
                  }
                })
                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
            />
          ),
        }
      },
    },
    {
      title: 'Fail Size',
      dataIndex: 'fail_size',
      key: 'fail_size',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.fail_size
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: (
            <InputNumber
              value={record.fail_size}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.fail_size = value
                  }
                })
                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
            />
          ),
        }
      },
    },
    {
      title: '',
      key: 'action',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Popconfirm
          // disabled={!record.isNew}
          title="Sure to delete?"
          onConfirm={() => deleteRow(record.key)}
        >
          <Button type="danger">
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      key: count,
      batch_size_min: 0,
      batch_size_max: 0,
      sample_size: 0,
      pass_size: 0,
      fail_size: 0,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
  }

  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    setTableData(newTableData)
  }
  useEffect(() => {
    if (aqlLevelData && aqlLevelData.aqlMain) {
      // prettier-ignore
      const { detail } = aqlLevelData.aqlMain;
      if (aqlLevelData.aqlMain.level_name) setLevelName(aqlLevelData.aqlMain.level_name)
      const intermediateTableData = []
      if (detail && detail.length > 0) {
        detail.forEach((item, index) =>
          intermediateTableData.push({
            key: index,
            ...item,
          }),
        )
      }
      setTableData(intermediateTableData)
    }
  }, [aqlLevelData])
  const onSubmit = () => {
    let isError = false
    let isBatchValidateError = false
    if (!levelName) {
      isError = true
      setLevelNameError('AQL Level name cannot be empty')
    }
    if (isError) {
      notification.error({
        message: 'Incorrect / Incomplete Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    if (!tableData || tableData.length === 0) {
      isError = true
      setTableDataError('Please add at least add one record')
    }

    const intermediateBatchDetails = []

    const detail = []

    const intermediateTableData = _.cloneDeep(tableData)

    intermediateTableData.forEach((record) => {
      record.recordError = {}
      if (!record.batch_size_min || record.batch_size_min < 0) {
        if (record.batch_size_min < 0) {
          isError = true
          record.recordError.batch_size_min = true
        }
      }

      if (!record.batch_size_max || record.batch_size_max === 0) {
        isError = true
        record.recordError.batch_size_max = true
      }

      if (!record.sample_size || record.sample_size === 0) {
        isError = true
        record.recordError.sample_size = true
      }

      if (!record.pass_size || record.pass_size < 0) {
        if (record.pass_size < 0) {
          isError = true
          record.recordError.pass_size = true
        }
      }

      if (!record.fail_size || record.fail_size < 0) {
        if (record.fail_size < 0) {
          isError = true
          record.recordError.fail_size = true
        }
      }

      const intermediateBatchDetail = {
        batch_size_min: record.batch_size_min,
        batch_size_max: record.batch_size_max,
      }

      intermediateBatchDetails.push(intermediateBatchDetail)

      detail.push({
        id: record.id || undefined,
        batch_size_min: record.batch_size_min,
        batch_size_max: record.batch_size_max,
        sample_size: record.sample_size,
        pass_size: record.pass_size,
        fail_size: record.fail_size,
      })
    })

    setTableData(intermediateTableData)

    if (!validateBatchDetails(_.sortBy(intermediateBatchDetails, 'batch_size_min'))) {
      isBatchValidateError = true
    }

    if (isBatchValidateError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the Batch are valid.',
      })
      return
    }

    if (isError) {
      if (isError)
        notification.error({
          message: 'Incorrect Data',
          description:
            'Please make sure all the mandatory fields are filled and have valid entries.',
        })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertAQLMain({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        levelName,
        detail,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/settings/qc-settings/aql-levels')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving AQL Levels.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const validateBatchDetails = (batch) => {
    if (batch.length > 0) {
      if (batch.length === 1) {
        return batch[0].batch_size_max > batch[0].batch_size_min
      }
      const batchError = []
      batch.forEach((element, index) => {
        if (index === 0) {
          // console.log(element.batch_size_max > element.batch_size_min)
          batchError.push(element.batch_size_max > element.batch_size_min)
        } else {
          // console.log(element.batch_size_max)
          // console.log(element.batch_size_min)
          // console.log(batch[index - 1].batch_size_max)
          // console.log(`${element.batch_size_max} > ${element.batch_size_min} = ${element.batch_size_max > element.batch_size_min}`)
          // console.log(`${element.batch_size_min} > ${batch[index - 1].batch_size_max} = ${element.batch_size_min > batch[index - 1].batch_size_max}`)
          batchError.push(
            element.batch_size_max > element.batch_size_min &&
              element.batch_size_min > batch[index - 1].batch_size_max,
          )
        }
      })
      // console.log(batchError)
      // console.log(!_.includes(batchError, false))
      return !_.includes(batchError, false)
    }
    return false
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (action === 'create' && !permissions.includes('createSettings')) return <Error403 />
  if (aqlLevelErr) return `Error occured while fetching data: ${aqlLevelErr.message}`

  return (
    <div>
      <Helmet title="ALQLevels" />

      <Spin spinning={aqlLevelLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} AQL Level</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateSettings') ? (
            <div className="col-1 pull-right">
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

        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Level Name<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={levelName}
                      onChange={({ target: { value } }) => setLevelName(value)}
                      disabled={disabled}
                      className={
                        levelNameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{levelNameError || ''}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <Table
                      dataSource={tableData}
                      columns={columns}
                      pagination={false}
                      className={tableDataError ? 'custom-error-border' : ''}
                      onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                    />
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
                    <Button onClick={addRow} type="default">
                      Add Row
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createSettings')) ||
          (action === 'update' && permissions.includes('updateSettings')) ? (
            <Button type="primary" onClick={onSubmit} disabled={disabled}>
              {okText}
            </Button>
          ) : null}
          &emsp;
          <Button danger onClick={() => history.goBack()}>
            Back
          </Button>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(AQLLevelForm))
