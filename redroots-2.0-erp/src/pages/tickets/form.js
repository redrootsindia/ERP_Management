/* eslint "no-unused-vars": "off" */
import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { Input, Button, Spin, Select, notification } from 'antd'
import FileUpload from 'components/FileUpload'
import { cloneDeep } from 'lodash'
import Error403 from 'components/Errors/403'
import TicketAssigneeHistory from './ticketHistory'
import { TICKET, UPSERT_TICKET, CHANGE_TICKET_STATUS, ADD_COMMENT, USERS } from './queries'
import { MATERIAL_PURCHASE_ORDERS } from '../purchase-orders/material/queries'
import { PRODUCT_PURCHASE_ORDERS } from '../purchase-orders/product/queries'
import { EMPLOYEE_NAMES_LIST_DEPARTMENT_WISE } from '../accounts/employees/queries'
import Comments from './comments'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const TicketForm = ({ user: { permissions, type, vendor_id, id: userID } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const isVendor = type === 'vendor'
  const vendorID = vendor_id ? [vendor_id] : []

  const [ticketType, setTicketType] = useState(undefined)
  const [ticketTypeError, setTicketTypeError] = useState(undefined)

  const [purchaseOrderType, setPurchaseOrderType] = useState(undefined)
  const [purchaseOrderIDs, setPurchaseOrderIDs] = useState([])

  const [purchaseOrdersList, setPurchaseOrderList] = useState([])

  const [title, setTitle] = useState(undefined)
  const [titleError, setTitleError] = useState(undefined)

  const [description, setDescription] = useState(undefined)
  const [descriptionError, setDescriptionError] = useState(undefined)

  const [existingFiles, setExistingFiles] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  console.log('uploadedFiles', uploadedFiles)
  const [deletedFiles, setDeletedFiles] = useState([])

  const [status, setStatus] = useState('In Progress')
  const [priority, setPriority] = useState(undefined)

  const [primaryAssignedTo, setPrimaryAssignedTo] = useState(undefined)
  const [assignedTo, setAssignedTo] = useState(undefined)
  const [assignedToError, setAssignedToError] = useState(undefined)

  const [userIDs, setUserIDs] = useState([])

  const [employeeNames, setEmployeeNames] = useState([])
  const [userNames, setUserNames] = useState([])
  const [remainingEmployeeNames, setRemainingEmployeeNames] = useState([])
  const [comment, setComment] = useState(undefined)
  const [commentError, setCommentError] = useState(undefined)
  const [commentFiles, setCommentFiles] = useState([])
  const [emptyFiles, setEmptyFiles] = useState(false)

  const [createdBy, setCreatedBy] = useState(null)

  const [refreshComments, setRefreshComments] = useState(false)

  // const [editMode, setEditMode] = useState(
  //   action === 'create' || (action === 'update' && permissions.includes('updateTicket')),
  // )
  // const [disabled, setDisabled] = useState(!editMode)

  const [changeStatus] = useMutation(CHANGE_TICKET_STATUS)

  const [upsertTicket] = useMutation(UPSERT_TICKET)

  const [addComment] = useMutation(ADD_COMMENT)

  const {
    loading: ticketLoad,
    error: ticketErr,
    data: ticketData,
  } = useQuery(TICKET, {
    variables: { id },
  })

  const refreshCommentsCallback = () => {
    setRefreshComments(false)
  }

  useEffect(() => {
    if (!ticketLoad && ticketData && ticketData.ticket) {
      if (ticketData.ticket.type) setTicketType(ticketData.ticket.type)
      if (ticketData.ticket.title) setTitle(ticketData.ticket.title)
      if (ticketData.ticket.description) setDescription(ticketData.ticket.description)
      if (ticketData.ticket.status) setStatus(ticketData.ticket.status)
      if (ticketData.ticket.assigned_to) setAssignedTo(ticketData.ticket.assigned_to)
      if (ticketData.ticket.assigned_to) setPrimaryAssignedTo(ticketData.ticket.assigned_to)
      if (ticketData.ticket.created_by) setCreatedBy(ticketData.ticket.created_by)
      if (ticketData.ticket.purchase_order_type)
        setPurchaseOrderType(ticketData.ticket.purchase_order_type)
      if (ticketData.ticket.purchase_order_ids && ticketData.ticket.purchase_order_ids.length)
        setPurchaseOrderIDs(
          ticketData.ticket.purchase_order_ids.map((purchaseOrderID) => String(purchaseOrderID)),
        )
      if (ticketData.ticket.user_ids && ticketData.ticket.user_ids.length)
        setUserIDs(ticketData.ticket.user_ids.map((user_ID) => String(user_ID)))
      if (ticketData.ticket.files && ticketData.ticket.files.length)
        setExistingFiles(ticketData.ticket.files)
      if (ticketData.ticket.priority) setPriority(ticketData.ticket.priority)
      // if (isVendor && ticketData.ticket.status === 'Closed') setDisabled(true)
    }
  }, [ticketData, ticketLoad])

  const {
    loading: employeeLoad,
    error: employeeErr,
    data: employeeData,
  } = useQuery(EMPLOYEE_NAMES_LIST_DEPARTMENT_WISE, { variables: { department: ticketType } })

  useEffect(() => {
    if (
      !employeeLoad &&
      employeeData &&
      employeeData.employeeNamesDepartmentWise &&
      employeeData.employeeNamesDepartmentWise.length
    ) {
      setEmployeeNames(
        employeeData.employeeNamesDepartmentWise.filter((obj) => obj.id !== String(userID)),
      )
    } else setEmployeeNames([])
  }, [employeeLoad, employeeData])

  const { loading: usersLoad, error: usersErr, data: usersData } = useQuery(USERS)

  useEffect(() => {
    if (!usersLoad && usersData && usersData.users && usersData.users.length) {
      setUserNames(usersData.users)
      setRemainingEmployeeNames(usersData.users)
    } else setUserNames([])
  }, [usersLoad, usersData])

  const [
    getProductPOData,
    {
      loading: productPurchaseOrderLoad,
      error: productPurchaseOrderErr,
      data: productPurchaseOrderData,
    },
  ] = useLazyQuery(PRODUCT_PURCHASE_ORDERS)

  useEffect(() => {
    if (
      productPurchaseOrderData &&
      productPurchaseOrderData.productPurchaseOrders &&
      productPurchaseOrderData.productPurchaseOrders.rows &&
      productPurchaseOrderData.productPurchaseOrders.rows.length
    )
      setPurchaseOrderList(productPurchaseOrderData.productPurchaseOrders.rows)
    else setPurchaseOrderList([])
  }, [productPurchaseOrderData, productPurchaseOrderLoad])

  const [
    getMaterialPOData,
    {
      loading: materialPurchaseOrderLoad,
      error: materialPurchaseOrderErr,
      data: materialPurchaseOrderData,
    },
  ] = useLazyQuery(MATERIAL_PURCHASE_ORDERS)

  useEffect(() => {
    if (
      materialPurchaseOrderData &&
      materialPurchaseOrderData.materialPurchaseOrders &&
      materialPurchaseOrderData.materialPurchaseOrders.rows &&
      materialPurchaseOrderData.materialPurchaseOrders.rows.length
    )
      setPurchaseOrderList(materialPurchaseOrderData.materialPurchaseOrders.rows)
    else setPurchaseOrderList([])
  }, [materialPurchaseOrderData, materialPurchaseOrderLoad])

  const onSubmit = () => {
    setTicketTypeError(undefined)
    setTitleError(undefined)
    setDescriptionError(undefined)

    let isError = false

    if (!ticketType) {
      isError = true
      setTicketTypeError('Ticket type cannot be empty')
    }
    if (!title) {
      isError = true
      setTitleError('Title cannot be empty')
    }
    if (!description) {
      isError = true
      setDescriptionError('Description cannot be empty')
    }

    if (!assignedTo) {
      isError = true
      setAssignedToError('Please Select whom to assignee the ticket')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    upsertTicket({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        type: ticketType,
        purchase_order_type: purchaseOrderType,
        purchase_order_ids: purchaseOrderIDs.map((purchaseOrderID) => Number(purchaseOrderID)),
        raised_by: isVendor
          ? 'Vendor'
          : permissions.includes('approveTicket')
          ? 'Admin'
          : 'Employee',
        title,
        description,
        status,
        assigned_to: assignedTo,
        files: uploadedFiles,
        deleted_files: deletedFiles,
        user_ids: userIDs.map(Number),
        priority,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        history.push('/tickets')
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while saving ticket.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const submitComment = () => {
    if (!comment) {
      setCommentError('Comment cannot be empty')
      return
    }
    addComment({
      variables: {
        ticket_id: id,
        text: comment,
        files: commentFiles,
      },
    })
      .then(() => {
        notification.success({ description: 'Comment saved Successfully.' })
        setRefreshComments(true)
        setEmptyFiles(true)
        setComment(undefined)
        setCommentFiles([])
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while saving comment.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readTicket')) return <Error403 />
  if (action === 'create' && !permissions.includes('createTicket')) return <Error403 />
  if (ticketErr) return `Error occured while fetching data: ${ticketErr.message}`
  if (usersErr) return `Error occured while fetching data: ${usersErr.message}`
  if (employeeErr) return `Error occured while fetching data: ${employeeErr.message}`
  if (productPurchaseOrderErr)
    return `Error occured while fetching data: ${productPurchaseOrderErr.message}`
  if (materialPurchaseOrderErr)
    return `Error occured while fetching data: ${materialPurchaseOrderErr.message}`

  return (
    <div>
      <Helmet title="Tickets" />

      <Spin spinning={ticketLoad || refreshComments} tip="Loading..." size="large">
        <div className="row mb-2 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-1">
              <strong>{id ? `Edit Ticket #${id}` : 'Add Ticket'}</strong>
            </h5>
          </div>
          {action === 'update' && (
            <div className="row mb-4">
              <div className="col-lg-12">
                <TicketAssigneeHistory id={id} />
              </div>
            </div>
          )}
          {/* 
          {!isVendor && action === 'update' && permissions.includes('updateTicket') ? (
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
          ) : null} */}
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-9">
                <div className="row mb-4">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Type<span className="custom-error-text"> *</span>
                    </div>
                    {action === 'update' ? (
                      ticketType
                    ) : (
                      <Select
                        showSearch
                        value={ticketType}
                        disabled={action === 'update'}
                        style={{ width: '100%' }}
                        onChange={(value) => {
                          setAssignedTo(undefined)
                          setTicketType(value)
                        }}
                        className={ticketTypeError ? 'custom-error-border' : ''}
                        placeholder="Select a Type"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {/* <Option key="Production" value="Production">
                            Production
                      </Option> */}
                        {/* {!isVendor || permissions.includes('approveTicket') ? (
                        <>
                          <Option key="Accounts" value="Accounts">
                            Accounts
                          </Option>
                          <Option key="Production" value="Production">
                            Production
                          </Option>
                        </>
                      ) : null} */}
                        <Select.Option key="Accounts" value="Accounts">
                          Accounts
                        </Select.Option>
                        <Select.Option key="Admin" value="Admin">
                          Admin
                        </Select.Option>
                        <Select.Option key="HR" value="HR">
                          HR
                        </Select.Option>
                        <Select.Option key="E-Commerce" value="E-Commerce">
                          E-Commerce
                        </Select.Option>
                        <Select.Option key="Warehouse" value="Warehouse">
                          Warehouse
                        </Select.Option>
                        <Select.Option key="Production" value="Production">
                          Production
                        </Select.Option>
                        <Select.Option key="Management" value="Management">
                          Management
                        </Select.Option>
                        <Select.Option key="ERP" value="ERP">
                          ERP
                        </Select.Option>
                      </Select>
                    )}
                    <div className="custom-error-text mb-4">{ticketTypeError || ''}</div>
                  </div>

                  {ticketType === 'Purchase Order' && (
                    <>
                      <div className="col-lg-2">
                        <div className="mb-2">PO Type</div>
                      </div>
                      <div className="col-lg-4">
                        <Select
                          showSearch
                          value={purchaseOrderType}
                          // disabled={disabled}
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            if (value === 'Product')
                              getProductPOData({ variables: { vendorIDs: vendorID } })
                            else getMaterialPOData({ variables: { vendorIDs: vendorID } })
                            setPurchaseOrderType(value)
                          }}
                          placeholder="Select PO type"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option key="Product" value="Product">
                            Product
                          </Option>
                          <Option key="Material" value="Material">
                            Material
                          </Option>
                        </Select>
                      </div>
                    </>
                  )}
                  {ticketType === 'Purchase Order' && purchaseOrderType && (
                    <>
                      <div className="col-lg-2">
                        <div className="mb-2">P.O. #</div>
                      </div>
                      <div className="col-lg-4">
                        <Select
                          mode="multiple"
                          showSearch
                          // disabled={disabled}
                          value={purchaseOrderIDs}
                          onChange={(value) => setPurchaseOrderIDs(value)}
                          placeholder="Select PO's"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          className="custom-pad-r1 mb-2 w-100"
                        >
                          {purchaseOrdersList && purchaseOrdersList.length
                            ? purchaseOrdersList.map((obj) => (
                                <Select.Option key={String(obj.id)} value={String(obj.id)}>
                                  {obj.id}
                                </Select.Option>
                              ))
                            : null}
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="col-lg-4">
                    <div className="mb-2">Assigned To</div>
                    <Select
                      showSearch
                      value={assignedTo}
                      // disabled={action === 'update'}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setAssignedTo(value)
                        console.log('assigned', assignedTo, typeof assignedTo)
                        console.log('value', value, typeof value)
                        if (action === 'update') {
                          const addCC = userNames
                            .filter((obj) => obj.employee_id !== null)
                            .find((e) => e.employee_id === String(assignedTo)).id
                          const removeCC = userNames
                            .filter((obj) => obj.employee_id !== null)
                            .find((e) => e.employee_id === String(value)).id

                          console.log('addcc', addCC, typeof addCC)
                          console.log('removeCC', removeCC, typeof removeCC)
                          // const removeCC=userNames.filter((obj)=>obj.employee_id !== null).find((e)=>e.employee_id===String(value)).id
                          // console.log("removeCC",removeCC)
                          // console.log("removeCC typeof",typeof removeCC)
                          if (!userIDs.includes(String(addCC)))
                            setUserIDs([...userIDs, String(addCC)])
                          else setUserIDs(userIDs.filter((key) => key !== String(addCC)))
                          console.log('users', userIDs)
                        }

                        // setUserIDs([])
                        // const assigneeName = employeeNames.find((e) => e.id === String(value))
                        // setRemainingEmployeeNames(
                        //   userNames.filter(
                        //     (obj) =>
                        //       obj.name !== String(assigneeName.name) && obj.id !== String(userID),
                        //   ),
                        // )
                      }}
                      placeholder="Select  a Employee"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {employeeNames && employeeNames.length
                        ? employeeNames.map((obj) => (
                            <Select.Option key={Number(obj.id)} value={Number(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{assignedToError || ''}</div>
                  </div>
                  <div className="col-lg-4">
                    <div className="mb-2">CC</div>
                    <Select
                      showSearch
                      mode="multiple"
                      value={userIDs}
                      // disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setUserIDs(value)}
                      placeholder="Select CC"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {userNames && userNames.length
                        ? userNames.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {`${obj.name} (${obj.employee_id ? 'Employee' : 'Vendor'})`}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">Priority</div>
                    {(action === 'update' &&
                      permissions.includes('updateTicket') &&
                      createdBy === Number(userID)) ||
                    (action === 'create' && permissions.includes('createTicket')) ? (
                      <Select
                        showSearch
                        value={priority}
                        // disabled={disabled}
                        style={{ width: '100%' }}
                        onChange={(value) => setPriority(value)}
                        placeholder="Select a priority"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        <Option key="High" value="High">
                          High
                        </Option>
                        <Option key="Low" value="Low">
                          Low
                        </Option>
                        <Option key="Medium" value="Medium">
                          Medium
                        </Option>
                      </Select>
                    ) : (
                      priority
                    )}
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-2">
                    <div className=" mb-2">
                      Title<span className="custom-error-text"> *</span>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    {action === 'update' ? (
                      title
                    ) : (
                      <Input
                        value={title}
                        onChange={({ target: { value } }) => setTitle(value)}
                        disabled={action === 'update'}
                        // className={
                        //   titleError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                        // }
                      />
                    )}
                    <div className="custom-error-text mb-4">{titleError || ''}</div>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-2">
                    <div className="mb-2">
                      Description<span className="custom-error-text"> *</span>
                    </div>
                  </div>
                  <div className="col-lg-10">
                    {action === 'update' ? (
                      description
                    ) : (
                      <Input.TextArea
                        value={description}
                        rows={8}
                        onChange={({ target: { value } }) => setDescription(value)}
                        disabled={action === 'update'}
                        // className={
                        //   descriptionError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                        // }
                      />
                    )}
                    <div className="custom-error-text mb-4">{descriptionError || ''}</div>
                  </div>
                </div>

                {/* <div className="row mb-2">
              
                </div> */}

                {/* {permissions.includes('approveTicket') && (
                  <div className="row">
                    <div className="col-lg-4">
                      <div className="mb-2">Status</div>
                      <Select
                        showSearch
                        value={status}
                        // disabled={disabled}
                        style={{ width: '100%' }}
                        onChange={(value) => setStatus(value)}
                        placeholder="Select a status"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        <Option key="Draft" value="Draft">
                          Draft
                        </Option>
                        <Option key="In Progress" value="In Progress">
                          In Progress
                        </Option>
                        <Option key="Completed" value="Completed">
                          Completed
                        </Option>
                        <Option key="Closed" value="Closed">
                          Closed
                        </Option>
                      </Select>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-2">Assigned To</div>
                      <Select
                        showSearch
                        value={assignedTo}
                        // disabled={disabled}
                        style={{ width: '100%' }}
                        onChange={(value) => setAssignedTo(value)}
                        placeholder="Select  a Employee"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {employeeNames && employeeNames.length
                          ? employeeNames.map((obj) => (
                              <Select.Option key={Number(obj.id)} value={Number(obj.id)}>
                                {obj.name}
                              </Select.Option>
                            ))
                          : null}
                      </Select>
                    </div>
                  </div>
                )} */}
              </div>

              <div className="col-3">
                <div className="mb-2">Files</div>

                <FileUpload
                  existingFileNames={existingFiles} // Always pass an array. If not empty, it should have names of files, without URL
                  prependURL={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_TICKET_URL}
                  placeholderType="general" // Accepted values: 'general' or 'profile'
                  onUploadCallback={(img) => {
                    setUploadedFiles([...uploadedFiles, ...img])
                  }}
                  onRemoveCallback={(imgName, isNew) => {
                    if (isNew) {
                      let tempFiles = cloneDeep(uploadedFiles)
                      console.log('tempFiles', tempFiles)
                      tempFiles = tempFiles.filter((obj) => obj.name !== imgName)
                      setUploadedFiles(tempFiles)
                    } else setDeletedFiles([...deletedFiles, imgName])
                  }}
                  maxFiles={20}
                  editMode={action !== 'create'}
                />
                <div className="mb-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          &emsp;
          {(action === 'create' && permissions.includes('createTicket')) ||
          (action === 'update' && permissions.includes('updateTicket')) ? (
            <Button
              type="primary"
              onClick={onSubmit}
              disabled={action === 'update' && status === 'Closed'}
            >
              Submit
            </Button>
          ) : null}
          &emsp;
          {action === 'update' &&
          permissions.includes('updateTicket') &&
          createdBy === Number(userID) ? (
            <Button
              type="primary"
              disabled={action === 'update' && status === 'Closed'}
              onClick={() => {
                changeStatus({
                  variables: {
                    id,
                    status: 'Closed',
                  },
                })
                  .then(() => {
                    notification.success({ description: 'Saved Successfully.' })
                    history.push('/tickets')
                  })
                  .catch((err) => {
                    notification.error({
                      message: 'Error occured while saving ticket.',
                      description: err.message || 'Please contact system administrator.',
                    })
                  })
              }}
            >
              Closed
            </Button>
          ) : null}
          &emsp;
          <Button danger onClick={() => history.push('/tickets')}>
            Back
          </Button>
        </div>

        {action === 'update' ? (
          <>
            <Comments
              ticket_id={id}
              refreshComments={refreshComments}
              refreshCommentsCallback={refreshCommentsCallback}
            />
            {status !== 'Closed' ? (
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-9">
                      <div className="mb-2">
                        Comment<span className="custom-error-text"> *</span>
                      </div>
                      <Input.TextArea
                        value={comment}
                        onChange={({ target: { value } }) => setComment(value)}
                        rows={8}
                      />
                      <div className="custom-error-text mb-4">{commentError || ''}</div>
                    </div>
                    <div className="col-3">
                      <div className="mb-2">Files</div>

                      <FileUpload
                        existingFileNames={[]} // Always pass an array. If not empty, it should have names of files, without URL
                        // prependURL={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_TICKET_URL}
                        placeholderType="general" // Accepted values: 'general' or 'profile'
                        onUploadCallback={(img) => setCommentFiles([...commentFiles, ...img])}
                        onRemoveCallback={(imgName, isNew) => {
                          if (isNew) {
                            let tempFiles = cloneDeep(commentFiles)
                            tempFiles = tempFiles.filter((obj) => obj.name !== imgName)
                            setCommentFiles(tempFiles)
                          }
                        }}
                        maxFiles={10}
                        emptyFiles={emptyFiles}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <Button type="primary" onClick={submitComment}>
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(TicketForm))
