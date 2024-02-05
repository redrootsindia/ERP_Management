import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
// prettier-ignore
import { Input, Button, Spin, Switch, Select, notification, Row, Col, Image, Popconfirm, Table, Tag } from 'antd'
// prettier-ignore
import { LoadingOutlined, EyeOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { capitalize, cloneDeep } from 'lodash'
import ImageUpload from 'components/ImageUpload'
import Error403 from 'components/Errors/403'
import { QC_APPOINTMENT } from '../appointments/queries'
import { AQL_CRITERIA_GENERALS } from '../../settings/qc-settings/general-defects/queries'
import { UPDATE_INSPECTION_PRODUCT, UPDATE_INSPECTION_PACK } from './queries'
import './qcFormStyle.scss'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const InspectionForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { id } = useParams()

  const [pack, setPack] = useState(false)
  const [aqlGeneralList, setAQLGeneralList] = useState([])
  const [inspectSpecs, setInspectSpecs] = useState({})
  const [currentSpecsID, setCurrentSpecsID] = useState(1)
  const [currentSpecsData, setCurrentSpecsData] = useState(null)
  const [totalItems, setTotalItems] = useState(0)
  const [defectRowKey, setDefectRowKey] = useState(1)

  // const [image, setImage] = useState(undefined)
  // const [existingImages, setExistingImages] = useState([])
  // const [imageChanged, setImageChanged] = useState(false)

  const tableColumns = [
    {
      title: 'Specification',
      dataIndex: 'specs_expected_value',
      key: 'specs_expected_value',
      width: '60%',
      onCell: () => ({ className: 'custom-pad-half' }),
      render: (specs_expected_value, obj) => (
        <div>
          <div style={{ paddingLeft: '8px', paddingBottom: '8px', fontWeight: 'bold' }}>
            Required {obj.specs_name}: {specs_expected_value}
          </div>
          <Input
            type="number"
            addonBefore={`Inspected ${obj.specs_name}:`}
            value={obj.specs_inspected_value || undefined}
            onChange={({ target: { value } }) =>
              onChangeInput(value, currentSpecsID, obj.specs_inspected_id)
            }
            style={{ width: '100%' }}
          />
        </div>
      ),
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      align: 'center',
      onHeaderCell: () => ({ className: 'custom-pad-half' }),
      onCell: () => ({ className: 'custom-pad-half' }),
      render: (text, obj) => (obj.specs_inspected_value - obj.specs_expected_value).toFixed(2),
    },
    {
      title: 'Threshold',
      dataIndex: 'specs_threshold',
      key: 'specs_threshold',
      align: 'center',
      onHeaderCell: () => ({ className: 'custom-pad-half' }),
      onCell: () => ({ className: 'custom-pad-half' }),
    },
    {
      title: 'Status',
      dataIndex: 'specs_inspected_status',
      key: 'specs_inspected_status',
      onHeaderCell: () => ({ className: 'custom-pad-half' }),
      onCell: () => ({ className: 'custom-pad-half' }),
      render: (status) =>
        status ? (
          <Tag
            icon={status === 'pass' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={status === 'pass' ? 'success' : 'error'}
          >
            {capitalize(status)}
          </Tag>
        ) : null,
    },
  ]

  const [editMode, setEditMode] = useState(
    permissions.includes('updateQCInspection') || permissions.includes('createQCInspection'),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState('Save')

  const {
    loading: aqlGeneralLoad,
    error: aqlGeneralErr,
    data: aqlGeneralData,
  } = useQuery(AQL_CRITERIA_GENERALS, { variables: { activeOnly: true } })

  const {
    loading: qcLoad,
    error: qcErr,
    data: qcData,
  } = useQuery(QC_APPOINTMENT, {
    variables: { id, toInspect: true, getAppointmentData: false },
  })

  const [updateInspectionProduct] = useMutation(UPDATE_INSPECTION_PRODUCT)
  const [updateInspectionPack] = useMutation(UPDATE_INSPECTION_PACK)

  useEffect(() => setCurrentSpecsData(inspectSpecs[currentSpecsID]), [currentSpecsID])

  useEffect(() => {
    if (qcData && qcData.productQCAppointment) {
      const {
        items_to_inspect,
        specs_data,
        general_criteria_data,
        pack: isPack,
      } = qcData.productQCAppointment

      const tempInspectSpecs = {}
      let tempDefectRowKey = 0

      if (items_to_inspect) {
        items_to_inspect.forEach((item, i) => {
          let specsData = []
          let generalCriteriaData = []

          if (specs_data) {
            if (!isPack)
              specsData = specs_data.filter(
                (obj) => Number(obj.qc_inspection_id) === Number(item.qc_inspection_id),
              )
            else
              specsData = specs_data.filter(
                (obj) =>
                  Number(obj.qc_inspection_id) === Number(item.qc_inspection_id) &&
                  Number(obj.qc_inspection_variant_id) === Number(item.qc_inspection_variant_id),
              )
          }

          if (general_criteria_data) {
            if (!isPack)
              generalCriteriaData = general_criteria_data.filter(
                (obj) => Number(obj.qc_inspection_id) === Number(item.qc_inspection_id),
              )
            else
              generalCriteriaData = general_criteria_data.filter(
                (obj) =>
                  Number(obj.qc_inspection_id) === Number(item.qc_inspection_id) &&
                  Number(obj.qc_inspection_variant_id) === Number(item.qc_inspection_variant_id),
              )
          }

          tempInspectSpecs[i + 1] = {
            qc_inspection_id: item.qc_inspection_id,
            qc_inspection_variant_id: item.qc_inspection_variant_id,
            variantID: item.product_variant_id,
            variantCode: item.variant_code,
            variantImage: item.image,
            packID: item.pack_id,
            packCode: item.pack_code,
            brandName: item.product_name,
            productID: item.product_id,
            productName: item.brand_name,
            specsData: specsData || [],
            generalCriteriaData: generalCriteriaData
              ? generalCriteriaData.map((obj) => {
                  tempDefectRowKey += 1
                  return {
                    ...obj,
                    key: tempDefectRowKey,
                    defectExistingImages: obj.aql_criteria_general_image
                      ? [
                          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_QC_URL}${obj.aql_criteria_general_image}`,
                        ]
                      : [],
                  }
                })
              : [],
          }
        })

        setInspectSpecs(tempInspectSpecs)
        setCurrentSpecsData(tempInspectSpecs[currentSpecsID])
        setTotalItems(tempInspectSpecs ? Object.keys(tempInspectSpecs).length : 0)
        setDefectRowKey(tempDefectRowKey + 1)
        if (isPack) setPack(true)
      }
    }
  }, [qcData])

  useEffect(() => {
    if (
      !aqlGeneralLoad &&
      aqlGeneralData &&
      aqlGeneralData.aqlCriteriaGenerals &&
      aqlGeneralData.aqlCriteriaGenerals.length
    )
      setAQLGeneralList(aqlGeneralData.aqlCriteriaGenerals)
  }, [aqlGeneralData, aqlGeneralLoad])

  const onChangeInput = (value, current_specs_id, specs_inspected_id) => {
    const tempInspectSpecs = cloneDeep(inspectSpecs)
    const tempObj = tempInspectSpecs[current_specs_id].specsData.find(
      (e) => Number(e.specs_inspected_id) === Number(specs_inspected_id),
    )

    if (tempObj && Object.keys(tempObj).length) {
      tempObj.specs_inspected_value = Number(value)

      const upperLimit = tempObj.specs_expected_value + tempObj.specs_threshold
      const lowerLimit = tempObj.specs_expected_value - tempObj.specs_threshold

      if (Number(value) < lowerLimit || Number(value) > upperLimit)
        tempObj.specs_inspected_status = 'fail'
      else tempObj.specs_inspected_status = 'pass'
    }

    setInspectSpecs(tempInspectSpecs)
    setCurrentSpecsData(tempInspectSpecs[currentSpecsID])
  }

  const onAddDefect = (current_specs_id) => {
    const tempInspectSpecs = cloneDeep(inspectSpecs)
    tempInspectSpecs[current_specs_id].generalCriteriaData.push({
      key: defectRowKey,
      is_new: true,
    })
    setInspectSpecs(tempInspectSpecs)
    setCurrentSpecsData(tempInspectSpecs[currentSpecsID])
    setDefectRowKey(defectRowKey + 1)
  }

  const onChangeSelect = (current_specs_id, rowKey, selectFor, selectValue) => {
    const tempInspectSpecs = cloneDeep(inspectSpecs)
    const tempObj = tempInspectSpecs[current_specs_id].generalCriteriaData.find(
      ({ key }) => Number(key) === Number(rowKey),
    )

    if (tempObj && Object.keys(tempObj).length) {
      if (selectFor === 'defectName') tempObj.aql_criteria_general_id = Number(selectValue)
      else if (selectFor === 'defectStatus') tempObj.aql_criteria_general_status = selectValue
    }

    setInspectSpecs(tempInspectSpecs)
    setCurrentSpecsData(tempInspectSpecs[currentSpecsID])
  }

  const onChangeImage = (current_specs_id, rowKey, imgFile) => {
    const tempInspectSpecs = cloneDeep(inspectSpecs)
    const tempObj = tempInspectSpecs[current_specs_id].generalCriteriaData.find(
      ({ key }) => Number(key) === Number(rowKey),
    )

    if (tempObj && Object.keys(tempObj).length) {
      tempObj.aql_criteria_general_image = imgFile
      tempObj.aql_criteria_general_image_changed = true
    }

    setInspectSpecs(tempInspectSpecs)
    setCurrentSpecsData(tempInspectSpecs[currentSpecsID])
  }

  const onSubmit = () => {
    // let isError = false
    // if (!uomID || Number(uomID) === 0) {
    //   isError = true
    //   setUOMIDError('Please select the unit of measurement')
    // }
    // if (!materialCode) {
    //   isError = true
    //   setMaterialCodeError('Material code cannot be empty')
    // }

    // if (isError) {
    //   notification.error({
    //     message: 'Incorrect Data',
    //     description: 'Please make sure all the mandatory fields are filled and have valid entries.',
    //   })
    //   return
    // }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    const inspectData = []

    Object.values(inspectSpecs).forEach((inspectObj) => {
      const specsArray = []
      inspectObj.specsData.forEach((e) => {
        // if (typeof e.specs_inspected_value === "number")
        specsArray.push({
          specs_inspected_id: e.specs_inspected_id,
          specs_inspected_value: e.specs_inspected_value,
          specs_inspected_status: e.specs_inspected_status,
        })
      })

      const genArray = inspectObj.generalCriteriaData
        ? inspectObj.generalCriteriaData.map((e) => {
            return {
              is_new: e.is_new,
              qc_inspection_data_general_id: Number(e.qc_inspection_data_general_id),
              aql_criteria_general_id: Number(e.aql_criteria_general_id),
              aql_criteria_general_status: e.aql_criteria_general_status,
              aql_criteria_general_image: e.aql_criteria_general_image,
              is_image_changed: e.aql_criteria_general_image_changed,
              status: e.status,
            }
          })
        : null

      const inspectPushObj = {
        qc_inspection_id: Number(inspectObj.qc_inspection_id),
        product_variant_id: Number(inspectObj.variantID),
        inspectSpecsData: specsArray,
        inspectGeneralData: genArray,
      }

      if (pack) {
        inspectPushObj.pack_id = inspectObj.packID ? Number(inspectObj.packID) : null
        inspectPushObj.qc_inspection_variant_id = inspectObj.qc_inspection_variant_id
          ? Number(inspectObj.qc_inspection_variant_id)
          : null
      }

      inspectData.push(inspectPushObj)
    })

    const mutationVariable = pack ? updateInspectionPack : updateInspectionProduct

    mutationVariable({ variables: { qc_appointment_id: id, inspectData } })
      .then(() => {
        setOkText('Save')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/qc/appointments')
      })
      .catch((err) => {
        setOkText('Save')
        notification.error({
          message: 'Error occured while saving QC-Inspection data.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readQCInspection')) return <Error403 />
  if (qcErr) return `Error occured while fetching data: ${qcErr.message}`
  if (aqlGeneralErr) return `Error occured while fetching data: ${aqlGeneralErr.message}`

  return (
    <div>
      <Helmet title="QC Inspection" />

      <Spin spinning={qcLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>QC Inspection</strong>
            </h5>
          </div>

          {permissions.includes('updateQCInspection') ? (
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

        <div className="card">
          <div className="card-body">
            <Row>
              <Col span={13}>
                <div className="leftQCBlock">
                  <Row>
                    <Col span={8}>
                      <div className="leftQCBlock-Details">
                        <Image
                          src={
                            process.env.REACT_APP_IMAGE_URL +
                            process.env.REACT_APP_PRODUCT_URL +
                            (currentSpecsData ? currentSpecsData.variantImage : null)
                          }
                          // height={currentSpecsData && currentSpecsData.variantImage ? 35 : 20}
                          width={100}
                          alt="general"
                          fallback="resources/images/placeholder/general.png"
                          preview={{ mask: <EyeOutlined /> }}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="leftQCBlock-Details">
                        <span className="QCBlock-boldText">Brand:</span>&nbsp;
                        {currentSpecsData ? currentSpecsData.brandName : null}
                      </div>
                      <div className="leftQCBlock-Details">
                        <span className="QCBlock-boldText">Product:</span>&nbsp;
                        {currentSpecsData ? currentSpecsData.productName : null}
                      </div>
                      <div className="leftQCBlock-Details">
                        <span className="QCBlock-boldText">BOM Code:</span>&nbsp;
                        {currentSpecsData ? currentSpecsData.variantCode : null}
                      </div>
                    </Col>
                  </Row>
                  <br />

                  <Table
                    columns={tableColumns}
                    dataSource={
                      currentSpecsData && currentSpecsData.specsData
                        ? currentSpecsData.specsData
                        : []
                    }
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    className="custom-pad-r1"
                    onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                    locale={{ emptyText: 'Nothing To Inspect' }}
                  />
                </div>
              </Col>

              <Col span={11}>
                <Button danger onClick={() => onAddDefect(currentSpecsID)}>
                  Add Defect
                </Button>
                <br />
                {currentSpecsData &&
                currentSpecsData.generalCriteriaData &&
                currentSpecsData.generalCriteriaData.length
                  ? currentSpecsData.generalCriteriaData.map((genObj) => (
                      <Row className="QCBlock-defectRow">
                        <Col span={8} className="custom-pad-r1">
                          Defect:
                          <Select
                            id="defect"
                            name="defect"
                            value={
                              genObj.aql_criteria_general_id
                                ? String(genObj.aql_criteria_general_id)
                                : undefined
                            }
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select one"
                            optionFilterProp="children"
                            onChange={(value) =>
                              onChangeSelect(currentSpecsID, genObj.key, 'defectName', value)
                            }
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {aqlGeneralList && aqlGeneralList.length
                              ? aqlGeneralList.map(({ id: aqlID, defect_name }) => (
                                  <Option key={aqlID} value={String(aqlID)}>
                                    {defect_name}
                                  </Option>
                                ))
                              : null}
                          </Select>
                        </Col>
                        <Col span={8} className="custom-pad-r1">
                          Status:
                          <Select
                            id="defectStatus"
                            name="defectStatus"
                            value={genObj.aql_criteria_general_status || undefined}
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select one"
                            optionFilterProp="children"
                            onChange={(value) =>
                              onChangeSelect(currentSpecsID, genObj.key, 'defectStatus', value)
                            }
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option key="critical" value="critical">
                              Critical
                            </Option>
                            <Option key="major" value="major">
                              Major
                            </Option>
                            <Option key="minor" value="minor">
                              Minor
                            </Option>
                          </Select>
                        </Col>
                        <Col span={6}>
                          <ImageUpload
                            existingImages={genObj.defectExistingImages || []} // Always pass an array. If not empty, it should have fully-formed URLs of images
                            placeholderType="general" // Accepted values: 'general' or 'profile'
                            onUploadCallback={(imgFile) =>
                              onChangeImage(currentSpecsID, genObj.key, imgFile)
                            }
                            onRemoveCallback={() => onChangeImage(currentSpecsID, genObj.key, null)}
                            maxImages={1}
                            editMode={!disabled}
                          />
                        </Col>
                        <Col span={2}>
                          <Popconfirm
                            title="Sure to delete?"
                            // onConfirm={() => deleteRow(record.key)}
                          >
                            <Button type="danger" disabled={disabled}>
                              <DeleteOutlined />
                            </Button>
                          </Popconfirm>
                        </Col>
                      </Row>
                    ))
                  : null}
              </Col>
            </Row>

            <Row>
              <Col span={10}>
                <div className="pull-right">
                  <Button
                    disabled={currentSpecsID === 1}
                    onClick={() => setCurrentSpecsID(currentSpecsID - 1)}
                  >
                    Previous
                  </Button>
                  &emsp;
                  <Button
                    type="primary"
                    disabled={totalItems === currentSpecsID}
                    onClick={() => setCurrentSpecsID(currentSpecsID + 1)}
                  >
                    Next
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {permissions.includes('createQCInspection') ||
          permissions.includes('updateQCInspection') ? (
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

export default withRouter(connect(mapStateToProps)(InspectionForm))
