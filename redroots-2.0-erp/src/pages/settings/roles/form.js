import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Table, Spin, Checkbox, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { ROLE, UPSERT_ROLE } from './queries'

const RolesForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, refetch,
    permissions: loggedInPermissions } = props

  const [action, setAction] = useState(type)
  const [roleID, setRoleID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [title, setTitle] = useState(undefined)
  const [titleError, setTitleError] = useState(undefined)
  const [permissions, setPermissions] = useState([])
  const [renderVar, setRenderVar] = useState(true)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && loggedInPermissions.includes('updateRole')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(roleID ? 'Save' : 'Create')

  const showActionButtons =
    // Number(roleID) !== 1 &&
    (action === 'create' && loggedInPermissions.includes('createRole')) ||
    (action === 'update' && loggedInPermissions.includes('updateRole'))

  const [upsertRole] = useMutation(UPSERT_ROLE)

  const { loading, error, data } = useQuery(ROLE, { variables: { id: roleID } })

  useEffect(() => {
    if (data && data.role) {
      if (data.role.title) setTitle(data.role.title)
      if (data.role.permissions) setPermissions(data.role.permissions)
    }
  }, [data])

  useEffect(() => {
    setRoleID(id)
    setTitleError(false)
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
    setRoleID(undefined)
    setAction('create')
    setOkText(roleID ? 'Save' : 'Create')
    setTitle(undefined)
    setTitleError(false)
    setPermissions([])
    setChangesMadeInForm(false)
    discardTableState()
  }

  const tableData = [
    {
      key: Math.random(),
      id: 'settingsRoles',
      title: 'Settings - Roles',
      view: 'readRole',
      create: 'createRole',
      edit: 'updateRole',
      approve: 'approveRole',
      delete: 'deleteRole',
    },
    {
      key: Math.random(),
      id: 'settingsOthers',
      title: 'Settings - Others',
      view: 'readSettings',
      create: 'createSettings',
      edit: 'updateSettings',
      approve: 'approveSettings',
      delete: 'deleteSettings',
    },
    {
      key: Math.random(),
      id: 'Employees',
      title: 'Employees',
      view: 'readEmployee',
      create: 'createEmployee',
      edit: 'updateEmployee',
      approve: 'approveEmployee',
      delete: 'deleteEmployee',
    },
    {
      key: Math.random(),
      id: 'Transport Report',
      title: 'Transport Report',
      view: 'readTransportReport',
      create: 'createTransportReport',
      edit: 'updateTransportReport',
      approve: 'approveTransportReport',
      delete: 'deleteTransportReport',
    },
    {
      key: Math.random(),
      id: 'Buyers',
      title: 'Buyers',
      view: 'readBuyer',
      create: 'createBuyer',
      edit: 'updateBuyer',
      approve: 'approveBuyer',
      delete: 'deleteBuyer',
    },
    {
      key: Math.random(),
      id: 'Vendors',
      title: 'Vendors',
      view: 'readVendor',
      create: 'createVendor',
      edit: 'updateVendor',
      approve: 'approveVendor',
      delete: 'deleteVendor',
    },
    {
      key: Math.random(),
      id: 'Purchase Bill',
      title: 'Purchase Bill',
      view: 'readPurchaseBill',
      create: 'createPurchaseBill',
      edit: 'updatePurchaseBill',
      approve: 'approvePurchaseBill',
      delete: 'deletePurchaseBill',
    },
    {
      key: Math.random(),
      id: 'Products',
      title: 'Products',
      view: 'readProduct',
      create: 'createProduct',
      edit: 'updateProduct',
      approve: 'approveProduct',
      delete: 'deleteProduct',
    },
    {
      key: Math.random(),
      id: 'Sample Products',
      title: 'Sample Products',
      view: 'readSampleProduct',
      create: 'createSampleProduct',
      edit: 'updateSampleProduct',
      approve: 'approveSampleProduct',
      delete: 'deleteSampleProduct',
    },
    {
      key: Math.random(),
      id: 'MarginCalculator',
      title: 'Margin Calculator',
      view: 'readMarginCalculator',
      create: 'createMarginCalculator',
      edit: 'updateMarginCalculator',
      approve: 'approveMarginCalculator',
      delete: 'deleteMarginCalculator',
    },
    {
      key: Math.random(),
      id: 'Purchase Orders',
      title: 'Purchase Orders',
      view: 'readPurchaseOrder',
      create: 'createPurchaseOrder',
      edit: 'updatePurchaseOrder',
      approve: 'approvePurchaseOrder',
      delete: 'deletePurchaseOrder',
    },
    {
      key: Math.random(),
      id: 'Materials',
      title: 'Materials',
      view: 'readMaterial',
      create: 'createMaterial',
      edit: 'updateMaterial',
      approve: 'approveMaterial',
      delete: 'deleteMaterial',
    },
    {
      key: Math.random(),
      id: 'Material Inwards',
      title: 'Material Inwards',
      view: 'readMaterialInward',
      create: 'createMaterialInward',
      edit: 'updateMaterialInward',
      approve: 'approveMaterialInward',
      delete: 'deleteMaterialInward',
    },
    {
      key: Math.random(),
      id: 'Material Reports',
      title: 'Material Reports',
      view: 'readMaterialReport',
      create: 'createMaterialReport',
      edit: 'updateMaterialReport',
      approve: 'approveMaterialReport',
      delete: 'deleteMaterialReport',
    },
    {
      key: Math.random(),
      id: 'Warehouses',
      title: 'Warehouses, Racks & Shelves',
      view: 'readWarehouse',
      create: 'createWarehouse',
      edit: 'updateWarehouse',
      approve: 'approveWarehouse',
      delete: 'deleteWarehouse',
    },
    {
      key: Math.random(),
      id: 'Put-Aways',
      title: 'Put-Aways',
      view: 'readPutAway',
      create: 'createPutAway',
      edit: 'updatePutAway',
      approve: 'approvePutAway',
      delete: 'deletePutAway',
    },
    {
      key: Math.random(),
      id: 'Stock-Transfers',
      title: 'Stock-Transfers',
      view: 'readStockTransfer',
      create: 'createStockTransfer',
      edit: 'updateStockTransfer',
      approve: 'approveStockTransfer',
      delete: 'deleteStockTransfer',
    },
    {
      key: Math.random(),
      id: 'Internal-Adjustments',
      title: 'Internal-Adjustments',
      view: 'readInternalAdjustment',
      create: 'createInternalAdjustment',
      edit: 'updateInternalAdjustment',
      approve: 'approveInternalAdjustment',
      delete: 'deleteInternalAdjustment',
    },
    {
      key: Math.random(),
      id: 'Write-Offs',
      title: 'Write-Offs',
      view: 'readWriteOff',
      create: 'createWriteOff',
      edit: 'updateWriteOff',
      approve: 'approveWriteOff',
      delete: 'deleteWriteOff',
    },
    {
      key: Math.random(),
      id: 'RTVs',
      title: 'RTVs',
      view: 'readRTV',
      create: 'createRTV',
      edit: 'updateRTV',
      approve: 'approveRTV',
      delete: 'deleteRTV',
    },
    {
      key: Math.random(),
      id: 'RTVs',
      title: 'RTVs Summary',
      view: 'readRTVSummary',
      create: 'createRTVSummary',
      edit: 'updateRTVSummary',
      approve: 'approveRTVSummary',
      delete: 'deleteRTVSummary',
    },
    {
      key: Math.random(),
      id: 'Sales Order Reports',
      title: 'Sales Orders Report',
      view: 'readSalesOrderReport',
      create: 'createSalesOrderReport',
      edit: 'updateSalesOrderReport',
      approve: 'approveSalesOrderReport',
      delete: 'deleteSalesOrderReport',
    },
    {
      key: Math.random(),
      id: ' Sales Orders',
      title: 'Sales Orders',
      view: 'readSalesOrder',
      create: 'createSalesOrder',
      edit: 'updateSalesOrder',
      approve: 'approveSalesOrder',
      delete: 'deleteSalesOrder',
    },
    {
      key: Math.random(),
      id: ' Sales Bills',
      title: 'Sales Bills',
      view: 'readSalesBill',
      create: 'createSalesBill',
      edit: 'updateSalesBill',
      approve: 'approveSalesBill',
      delete: 'deleteSalesBill',
    },
    {
      key: Math.random(),
      id: 'Pick Lists',
      title: 'Pick Lists',
      view: 'readPickList',
      create: 'createPickList',
      edit: 'updatePickList',
      approve: 'approvePickList',
      delete: 'deletePickList',
    },
    {
      key: Math.random(),
      id: 'SO Status',
      title: 'SO Status',
      view: 'readSalesOrderStatus',
      create: 'createSalesOrderStatus',
      edit: 'updateSalesOrderStatus',
      approve: 'approveSalesOrderStatus',
      delete: 'deleteSalesOrderStatus',
    },
    {
      key: Math.random(),
      id: 'QC Appointments',
      title: 'QC Appointments',
      view: 'readQCAppointment',
      create: 'createQCAppointment',
      edit: 'updateQCAppointment',
      approve: 'approveQCAppointment',
      delete: 'deleteQCAppointment',
    },
    {
      key: Math.random(),
      id: 'QC Inspections',
      title: 'QC Inspections',
      view: 'readQCInspection',
      create: 'createQCInspection',
      edit: 'updateQCInspection',
      approve: 'approveQCInspection',
      delete: 'deleteQCInspection',
    },
    {
      key: Math.random(),
      id: 'Packaging Lists',
      title: 'Packaging Lists',
      view: 'readPackagingList',
      create: 'createPackagingList',
      edit: 'updatePackagingList',
      approve: 'approvePackagingList',
      delete: 'deletePackagingList',
    },
    {
      key: Math.random(),
      id: 'Expenses',
      title: 'Expense Management',
      view: 'readExpenseManagement',
      create: 'createExpenseManagement',
      edit: 'updateExpenseManagement',
      approve: 'approveExpenseManagement',
      delete: 'deleteExpenseManagement',
    },
    {
      key: Math.random(),
      id: 'Expense Summary',
      title: 'Expense Summary',
      view: 'readExpenseSummary',
      create: 'createExpenseSummary',
      edit: 'updateExpenseSummary',
      approve: 'approveExpenseSummary',
      delete: 'deleteExpenseSummary',
    },
    {
      key: Math.random(),
      id: 'Weekly Payment',
      title: 'Weekly Payment',
      view: 'readWeeklyPayment',
      create: 'createWeeklyPayment',
      edit: 'updateWeeklyPayment',
      approve: 'approveWeeklyPayment',
      delete: 'deleteWeeklyPayment',
    },
    {
      key: Math.random(),
      id: 'Debit Notes',
      title: 'Debit Notes',
      view: 'readDebitNotes',
      create: 'createDebitNotes',
      edit: 'updateDebitNotes',
      approve: 'approveDebitNotes',
      delete: 'deleteDebitNotes',
    },
    {
      key: Math.random(),
      id: 'Financial Dashboard',
      title: 'Financial Dashboard',
      view: 'readFinancialDashboard',
      create: 'createFinancialDashboard',
      edit: 'updateFinancialDashboard',
      approve: 'approveFinancialDashboard',
      delete: 'deleteFinancialDashboard',
    },
    {
      key: Math.random(),
      id: 'Accounts Funds',
      title: 'Accounts Funds',
      view: 'readAccountFunds',
      create: 'createAccountFunds',
      edit: 'updateAccountFunds',
      approve: 'approveAccountFunds',
      delete: 'deleteAccountFunds',
    },
    {
      key: Math.random(),
      id: 'Delivery Appointments',
      title: 'Delivery Appointments',
      view: 'readDeliveryAppointment',
      create: 'createDeliveryAppointment',
      edit: 'updateDeliveryAppointment',
      approve: 'approveDeliveryAppointment',
      delete: 'deleteDeliveryAppointment',
    },
    {
      key: Math.random(),
      id: 'Packs',
      title: 'Packs',
      view: 'readPack',
      create: 'createPack',
      edit: 'updatePack',
      approve: 'approvePack',
      delete: 'deletePack',
    },
    {
      key: Math.random(),
      id: 'Inventory Overviews',
      title: 'Inventory Overviews',
      view: 'readInventoryOverview',
      create: 'createInventoryOverview',
      edit: 'updateInventoryOverview',
      approve: 'approveInventoryOverview',
      delete: 'deleteInventoryOverview',
    },
    {
      key: Math.random(),
      id: 'Production Summary',
      title: 'Production Summary',
      view: 'readProductionSummary',
      create: 'createProductionSummary',
      edit: 'updateProductionSummary',
      approve: 'approveProductionSummary',
      delete: 'deleteProductionSummary',
    },
    {
      key: Math.random(),
      id: 'Summary Dashboard',
      title: 'Summary Dashboard',
      view: 'readSummaryDashboard',
      create: 'createSummaryDashboard',
      edit: 'updateSummaryDashboard',
      approve: 'approveSummaryDashboard',
      delete: 'deleteSummaryDashboard',
    },
    {
      key: Math.random(),
      id: ' Dashboard',
      title: ' Dashboard',
      view: 'readDashboard',
      create: 'createDashboard',
      edit: 'updateDashboard',
      approve: 'approveDashboard',
      delete: 'deleteDashboard',
    },
    {
      key: Math.random(),
      id: ' Tickets',
      title: ' Tickets',
      view: 'readTicket',
      create: 'createTicket',
      edit: 'updateTicket',
      approve: 'approveTicket',
      delete: 'deleteTicket',
    },
    {
      key: Math.random(),
      id: ' Tickets Dashboard',
      title: ' Tickets Dashboard',
      view: 'readTicketDashboard',
      create: 'createTicketDashboard',
      edit: 'updateTicketDashboard',
      approve: 'approveTicketDashboard',
      delete: 'deleteTicketDashboard',
    },
    {
      key: Math.random(),
      id: ' Materials Dashboard',
      title: ' Materials Dashboard',
      vriew: 'readMaterialDashboard',
      ceate: 'createMaterialDashboard',
      edit: 'updateMaterialDashboard',
      approve: 'approveMaterialDashboard',
      delete: 'deleteMaterialDashboard',
    },
    {
      key: Math.random(),
      id: ' Product Plan',
      title: ' Product Plan',
      view: 'readProductPlan',
      create: 'createProductPlan',
      edit: 'updateProductPlan',
      approve: 'approveProductPlan',
      delete: 'deleteProductPlan',
    },
    {
      key: Math.random(),
      id: 'Ageing Report',
      title: 'Ageing Report',
      view: 'readAgeingReport',
      create: 'createAgeingReport',
      edit: 'updateAgeingReport',
      approve: 'approveAgeingReport',
      delete: 'deleteAgeingReport',
    },
    {
      key: Math.random(),
      id: 'Proforma Invoice',
      title: 'Proforma Invoice',
      view: 'readProformaInvoice',
      create: 'createProformaInvoice',
      edit: 'updateProformaInvoice',
      approve: 'approveProformaInvoice',
      delete: 'deleteProformaInvoice',
    },
    {
      key: Math.random(),
      id: 'Pi Summary',
      title: 'Pi Summary',
      view: 'readPiSummary',
      create: 'createPiSummary',
      edit: 'updatePiSummary',
      approve: 'approvePiSummary',
      delete: 'deletePiSummary',
    },
    {
      key: Math.random(),
      id: 'Brand Payment',
      title: 'Brand Payment',
      view: 'readBrandPayment',
      create: 'createBrandPayment',
      edit: 'updateBrandPayment',
      approve: 'approveBrandPayment',
      delete: 'deleteBrandPayment',
    },
    {
      key: Math.random(),
      id: 'Vendor Appointment',
      title: 'Vendor Appointment',
      view: 'readVendorAppointment',
      create: 'createVendorAppointment',
      edit: 'updateVendorAppointment',
      approve: 'approveVendorAppointment',
      delete: 'deleteVendorAppointment',
    },
  ]

  const tableColumns = [
    {
      title: 'Module',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'View',
      dataIndex: 'view',
      key: 'view',
      render: (text, record) => renderCell(text, record, 'view'),
    },
    {
      title: 'Create',
      dataIndex: 'create',
      key: 'create',
      render: (text, record) => renderCell(text, record, 'create'),
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      key: 'edit',
      render: (text, record) => renderCell(text, record, 'edit'),
    },
    {
      title: 'Approve',
      dataIndex: 'approve',
      key: 'approve',
      render: (text, record) => renderCell(text, record, 'approve'),
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      key: 'delete',
      render: (text, record) => renderCell(text, record, 'delete'),
    },
  ]

  const renderCell = (text, record, column) => {
    // const checkboxDisabled = disabled || Number(roleID) === 1 || (text && text.includes('delete'))
    const checkboxDisabled =
      disabled ||
      (text &&
        (text.includes('delete') ||
          text.includes('createDashboard') ||
          text.includes('updateDashboard') ||
          text.includes('approveDashboard') ||
          text.includes('createTicketDashboard') ||
          text.includes('updateTicketDashboard') ||
          text.includes('approveTicketDashboard') ||
          text.includes('createMaterialDashboard') ||
          text.includes('updateMaterialDashboard') ||
          text.includes('approveMaterialDashboard') ||
          text.includes('createAgeingReport') ||
          text.includes('updateAgeingReport') ||
          text.includes('approveAgeingReport')))
    return (
      <Checkbox
        onChange={({ target: { checked } }) => onChangeCheckbox(checked, record, column)}
        id={column}
        checked={permissions && permissions.includes(text)}
        disabled={checkboxDisabled}
        className={checkboxDisabled ? 'disabledStyle' : ''}
      />
    )
  }

  const onChangeCheckbox = (checked, record, column) => {
    // Find the index of the existing value. If non-existent, then it will return -1.
    const permIndex = permissions.findIndex((perm) => perm === record[column])

    const newPermissions = JSON.parse(JSON.stringify(permissions))
    if (permIndex > -1) {
      if (!checked) newPermissions.splice(permIndex, 1)
    } else newPermissions.push(record[column])

    setRenderVar(!renderVar)
    setPermissions(newPermissions)
    setChangesMadeInForm(true)
  }

  const onSubmit = () => {
    setTitleError(undefined)

    let isError = false
    if (!title) {
      isError = true
      setTitleError('Title cannot be empty')
    }

    if (!isError) {
      setOkText(
        <span>
          <LoadingOutlined />
          &emsp;Saving ...
        </span>,
      )

      upsertRole({
        variables: { upsertType: roleID ? 'update' : 'create', id: roleID, title, permissions },
      })
        .then(() => {
          setOkText(roleID ? 'Save' : 'Create')
          notification.success({ description: 'Saved Successfully.' })
          discardChanges()
          if (refetch) refetch()
        })
        .catch((err) => {
          setOkText(roleID ? 'Save' : 'Create')
          notification.error({
            message: 'Error occured while saving role.',
            description: err.message || 'Please contact system administrator.',
          })
        })
    }
  }

  if (!loggedInPermissions.includes('readRole')) return null
  if (action === 'create' && !loggedInPermissions.includes('createRole')) return null
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="Roles" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{roleID ? 'Edit' : 'Add'} Role</strong>
                </h5>
              </div>

              {/* {Number(roleID) !== 1 && action === 'update' && loggedInPermissions.includes('updateRole') ? ( */}
              {action === 'update' && loggedInPermissions.includes('updateRole') ? (
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
            <div className="mb-2">
              Title<span className="custom-error-text"> *</span>
            </div>
            <Input
              // disabled={(roleID && Number(roleID) === 1) || disabled}
              disabled={disabled}
              value={title}
              onChange={({ target: { value } }) => {
                setTitle(value)
                setChangesMadeInForm(true)
              }}
              className={
                titleError
                  ? 'custom-error-border'
                  : disabled // disabled || Number(roleID) === 1
                  ? 'disabledStyle'
                  : ''
              }
            />
            <div className="custom-error-text mb-4">{titleError || ''}</div>

            <Table
              columns={tableColumns}
              dataSource={tableData}
              pagination={false}
              rowKey={(record) => String(record.id)}
              className="mb-5"
            />

            <div className="row mt-4 mb-4 ml-2">
              {showActionButtons ? (
                <>
                  <Button
                    type="primary"
                    onClick={onSubmit}
                    disabled={disabled}
                    // disabled={(roleID && Number(roleID) === 1) || disabled}
                  >
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

export default RolesForm
