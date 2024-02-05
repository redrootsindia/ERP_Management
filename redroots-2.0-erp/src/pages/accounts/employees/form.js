import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification, Tag } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ImageUpload from 'components/ImageUpload'
import Error403 from 'components/Errors/403'
import { EMPLOYEE, UPSERT_EMPLOYEE } from './queries'
import { ROLES } from '../../settings/roles/queries'

const mapStateToProps = ({ user }) => ({ user })

const EmployeeForm = ({ user: { permissions, type, employee_id } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)
  const [email, setEmail] = useState(undefined)
  const [emailError, setEmailError] = useState(undefined)
  const [phone, setPhone] = useState(undefined)

  const [departments, setDepartments] = useState([])
  const [departmentsError, setDepartmentError] = useState(undefined)

  const [password, setPassword] = useState(undefined)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [passwordError, setPasswordError] = useState(undefined)

  const [roleID, setRoleID] = useState(undefined)
  const [roleIDError, setRoleIDError] = useState(undefined)
  const [rolesList, setRolesList] = useState([])

  const [profilePic, setProfilePic] = useState(undefined)
  const [existingImages, setExistingImages] = useState([])
  const [profilePicChanged, setProfilePicChanged] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' ||
      (action === 'update' && permissions.includes('updateEmployee')) ||
      type === 'admin',
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertEmployee] = useMutation(UPSERT_EMPLOYEE)
  const { loading: roleLoad, error: roleErr, data: roleData } = useQuery(ROLES)
  const {
    loading: empLoad,
    error: empErr,
    data: employeeData,
  } = useQuery(EMPLOYEE, {
    variables: { id },
  })

  useEffect(() => {
    if (employeeData && employeeData.employee) {
      const { profile_pic, role_id } = employeeData.employee

      if (role_id) setRoleID(String(role_id))
      if (employeeData.employee.name) setName(employeeData.employee.name)
      if (employeeData.employee.email) setEmail(employeeData.employee.email)
      if (employeeData.employee.password) setPassword(employeeData.employee.password)
      if (employeeData.employee.phone) setPhone(employeeData.employee.phone)
      if (employeeData.employee.departments)
        setDepartments(employeeData.employee.departments.map(String))
      if (profile_pic) {
        setProfilePic(profile_pic)
        setExistingImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_PROFILE_PIC_URL}${profile_pic}`,
        ])
      }
    }
  }, [employeeData])

  useEffect(() => {
    if (!roleLoad && roleData && roleData.roles && roleData.roles.length)
      setRolesList(roleData.roles)
  }, [roleData, roleLoad])

  const onSubmit = () => {
    setNameError(undefined)
    setEmailError(undefined)
    setPasswordError(undefined)
    setRoleIDError(undefined)
    setDepartmentError(undefined)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Employee name cannot be empty')
    }
    if (!departments || departments.length === 0) {
      isError = true
      setDepartmentError('Department cannot be empty')
    }
    if (!email) {
      isError = true
      setEmailError('Login email cannot be empty')
    } else {
      const lastAtPos = email.lastIndexOf('@')
      const lastDotPos = email.lastIndexOf('.')
      if (
        !/^[a-zA-Z0-9_]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,15})$/.test(
          email,
        )
      ) {
        isError = true
        setEmailError('Entered email is invalid.')
      } else if (
        !(
          lastAtPos < lastDotPos &&
          lastAtPos > 0 &&
          lastDotPos > 2 &&
          email.length - lastDotPos > 2 &&
          email.indexOf('@@') === -1 &&
          email.indexOf('@-') === -1 &&
          email.indexOf('-.') === -1 &&
          email.indexOf('--') === -1 &&
          email[0] !== '_'
        )
      ) {
        isError = true
        setEmailError('Entered email is invalid.')
      }
    }
    if (!password) {
      isError = true
      setPasswordError('Login password cannot be empty')
    }
    if (type === 'admin' && permissions.includes('updateEmployee')) {
      if (!roleID || Number(roleID) === 0) {
        isError = true
        setRoleIDError('Please assign a role')
      }
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

    upsertEmployee({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        name,
        email,
        password,
        phone,
        role_id: Number(roleID),
        profile_pic: profilePic,
        is_profile_pic_changed: profilePicChanged,
        departments: departments.map(String),
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/accounts/employees')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving employee.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }
  if (
    type === 'admin' &&
    Number(id) !== Number(employee_id) &&
    !permissions.includes('updateEmployee')
  )
    return <Error403 />
  if (type === 'vendor') return <Error403 />
  if (!permissions.includes('readEmployee')) return <Error403 />
  if (action === 'create' && !permissions.includes('createEmployee')) return <Error403 />
  if (empErr) return `Error occured while fetching data: ${empErr.message}`
  if (roleErr) return `Error occured while fetching data: ${roleErr.message}`

  return (
    <div>
      <Helmet title="Employees" />

      <Spin spinning={empLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Employee</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateEmployee') ? (
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
          <div className="col-xl-9 col-lg-12">
            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-3">
                  <strong>GENERAL DETAILS</strong>
                </h6>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="mb-2">
                      Employee Name<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={name}
                      onChange={({ target: { value } }) => setName(value)}
                      disabled={disabled}
                      className={
                        nameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{nameError || ''}</div>

                    <div className="mb-2">Phone</div>
                    <Input
                      value={phone}
                      onChange={({ target: { value } }) => setPhone(value)}
                      disabled={disabled}
                      className={disabled ? 'disabledStyle' : ''}
                    />
                  </div>
                  <div className="col-lg-6">
                    <div className="mb-2">Department</div>
                    {type === 'admin' && permissions.includes('updateEmployee') ? (
                      <>
                        <Select
                          mode="multiple"
                          showSearch
                          value={departments}
                          onChange={(value) => setDepartments(value)}
                          placeholder="Select Department"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          className="custom-pad-r1 mb-2 w-100"
                        >
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
                      </>
                    ) : departments && departments.length ? (
                      departments.map((department) => <Tag>{department}</Tag>)
                    ) : null}
                    <div className="custom-error-text mb-4">{departmentsError || ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-12">
            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-3">
                  <strong>ACCOUNT DETAILS</strong>
                </h6>
                <div className="mb-2">Profile Pic</div>
                <ImageUpload
                  existingImages={existingImages} // Always pass an array. If not empty, it should have fully-formed URLs of images
                  placeholderType="profile" // Accepted values: 'general' or 'profile'
                  onUploadCallback={(imgFile) => {
                    setProfilePic(imgFile)
                    setProfilePicChanged(true)
                  }}
                  onRemoveCallback={() => {
                    setProfilePic(null)
                    setProfilePicChanged(true)
                  }}
                  maxImages={1}
                  editMode={!disabled}
                />
                <div className="mb-4" />

                <div className="mb-2">
                  e-mail<span className="custom-error-text"> *</span>
                </div>
                <Input
                  autoComplete="off"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                  disabled={disabled}
                  className={emailError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{emailError || ''}</div>

                <div className="mb-2">
                  Password<span className="custom-error-text"> *</span>
                </div>
                <Input.Password
                  autoComplete="new-password"
                  value={password}
                  onChange={({ target: { value } }) => {
                    setPassword(value)
                    setPasswordChanged(true)
                  }}
                  disabled={disabled}
                  visibilityToggle={passwordChanged}
                  className={
                    passwordError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{passwordError || ''}</div>
                {type === 'admin' && permissions.includes('updateEmployee') && (
                  <>
                    <div className="mb-2">
                      Role<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={roleID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setRoleID(value)}
                      className={
                        roleIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select a role"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {rolesList && rolesList.length
                        ? rolesList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.title}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{roleIDError || ''}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createEmployee')) ||
          (action === 'update' && permissions.includes('updateEmployee')) ||
          type === 'admin' ? (
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

export default withRouter(connect(mapStateToProps)(EmployeeForm))
