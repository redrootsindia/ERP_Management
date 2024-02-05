import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, InputNumber, Button, Spin, Switch, Tabs, Table, notification } from 'antd'
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import { WAREHOUSE, UPSERT_WAREHOUSE } from './queries'
import PDFDownload from './pdfDownload'

const { TabPane } = Tabs

const mapStateToProps = ({ user }) => ({ user })

const WarehouseForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const shelfColumns = [
    {
      title: 'Shelf Name',
      key: 'name',
      dataIndex: 'name',
      render: (text, record) => (
        <Input
          value={text}
          onChange={({ target: { value } }) => onChangeRow(value, record.id, 'name')}
        />
      ),
    },
    {
      title: 'Length (l)',
      key: 'length',
      dataIndex: 'length',
      width: '15%',
      render: (text, record) => (
        <InputNumber
          min={1}
          value={Number(text) || null}
          onChange={(e) => onChangeRow(e, record.id, 'length')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Breadth (b)',
      key: 'breadth',
      dataIndex: 'breadth',
      width: '16%',
      render: (text, record) => (
        <InputNumber
          min={1}
          value={Number(text) || null}
          onChange={(e) => onChangeRow(e, record.id, 'breadth')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Height (h)',
      key: 'height',
      dataIndex: 'height',
      width: '15%',
      render: (text, record) => (
        <InputNumber
          min={1}
          value={Number(text) || null}
          onChange={(e) => onChangeRow(e, record.id, 'height')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Active / Inactive',
      key: 'active',
      dataIndex: 'active',
      width: '21%',
      render: () => (
        <Switch />
        // checked={editMode}
        // onChange={(checked) => {
        //   setEditMode(checked)
        //   setDisabled(!checked)
        // }}
      ),
    },
    {
      title: '',
      key: 'action',
      dataIndex: 'action',
      width: '6%',
      render: (text, record) => (
        <Button type="danger" onClick={() => removeShelf(record.key)}>
          <DeleteOutlined />
        </Button>
      ),
    },
  ]

  const [warehouseName, setWarehouseName] = useState(undefined)
  const [warehouseNameError, setWarehouseNameError] = useState(undefined)
  const [warehouseLocation, setWarehouseLocation] = useState(undefined)
  const [warehouseLocationError, setWarehouseLocationError] = useState(undefined)

  const initialShelves = [
    {
      key: '1ABC',
      name: 'Shelf A',
      length: 1,
      breadth: 1,
      height: 1,
      active: true,
    },
  ]

  const initialRacks = [
    {
      name: 'Rack 1',
      key: '1ABC',
      active: true,
      shelves: initialShelves,
      noOfShelves: initialShelves.length,
    },
  ]

  const [racks, setRacks] = useState(initialRacks)
  const [deletedRacks, setDeletedRacks] = useState([])
  const [deletedShelves, setDeletedShelves] = useState([])
  const [activeKey, setActiveKey] = useState(initialRacks[0].key)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateWarehouse')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertWarehouse] = useMutation(UPSERT_WAREHOUSE)
  const {
    loading: whLoad,
    error: whErr,
    data: warehouseData,
  } = useQuery(WAREHOUSE, {
    variables: { id },
  })

  useEffect(() => {
    if (warehouseData && warehouseData.warehouse) {
      const { name, location, racks: racksData } = warehouseData.warehouse

      if (name) setWarehouseName(name)
      if (location) setWarehouseLocation(location)

      if (racksData && racksData.length) {
        const tempRacks = racksData.map(({ id: rackID, name: rackName, shelves, active }) => {
          const shelfDataSource =
            shelves && shelves.length
              ? shelves.map((shelfObj) => {
                  return {
                    key: String(shelfObj.id),
                    id: String(shelfObj.id),
                    name: shelfObj.name,
                    length: shelfObj.length || undefined,
                    breadth: shelfObj.breadth || undefined,
                    height: shelfObj.height || undefined,
                    active: shelfObj.active,
                    isNew: false,
                  }
                })
              : []

          return {
            key: String(rackID),
            id: String(rackID),
            name: rackName,
            shelves: shelfDataSource,
            noOfShelves: shelfDataSource.length,
            active,
            isNew: false,
          }
        })
        setRacks(tempRacks)
        setActiveKey(tempRacks[0].key)
      }
    }
  }, [warehouseData])

  const addRack = () => {
    const tempRacks = JSON.parse(JSON.stringify(racks))
    const racksCount = tempRacks.length

    tempRacks.push({
      name: `Rack ${Number(racksCount) + 1}`,
      key: `${Number(racksCount) + 1}Rack`,
      shelves: initialShelves,
      noOfShelves: initialShelves.length,
      active: true,
      isNew: true,
    })

    setRacks(tempRacks)
    setActiveKey(`${Number(racksCount) + 1}Rack`)
  }

  const removeRack = (targetKey) => {
    const tempDeletedRacks = JSON.parse(JSON.stringify(deletedRacks))

    let lastIndex
    const tempRacks = []
    racks.forEach((rack, i) => {
      if (rack.key !== targetKey) tempRacks.push(rack)
      else {
        lastIndex = i - 1
        if (!rack.isNew) tempDeletedRacks.push(rack.id)
      }
    })
    // console.log("racks after removal: ", tempRacks);

    if (tempRacks.length && activeKey === targetKey) {
      if (lastIndex >= 0) setActiveKey(tempRacks[lastIndex].key)
      else setActiveKey(tempRacks[0].key)
    }

    setRacks(tempRacks)
    setDeletedRacks(tempDeletedRacks)
  }

  const addShelf = () => {
    const tempRacks = racks.map((rackObj) => {
      if (rackObj.key === activeKey) {
        const newShelfDataSource = rackObj.shelves
        const oldLength = rackObj.shelves.length

        newShelfDataSource.push({
          key: `${Number(oldLength + 1)}Shelf`,
          name: `Shelf ${String.fromCharCode(Number(oldLength) + 65)}`,
          length: 1,
          breadth: 1,
          height: 1,
          active: true,
          isNew: true,
        })

        return {
          ...rackObj,
          shelves: newShelfDataSource,
          noOfShelves: newShelfDataSource.length,
        }
      }
      return rackObj
    })

    setRacks(tempRacks)
  }

  const removeShelf = (shelfKey) => {
    const tempDeletedShelves = JSON.parse(JSON.stringify(deletedShelves))

    const tempRacks = racks.map((rackObj) => {
      if (rackObj.key === activeKey) {
        const newShelfDataSource = []

        rackObj.shelves.forEach((shelf) => {
          if (shelf.key !== shelfKey) newShelfDataSource.push(shelf)
          else if (!shelf.isNew) tempDeletedShelves.push(shelf.id)
        })

        return {
          ...rackObj,
          shelves: newShelfDataSource,
          noOfShelves: newShelfDataSource.length,
        }
      }

      return rackObj
    })

    setRacks(tempRacks)
    setDeletedShelves(tempDeletedShelves)
  }

  const onChangeRackProps = (e, varName) => {
    const tempRacks = racks.map((rackObj) => {
      if (rackObj.key === activeKey) return { ...rackObj, [varName]: e.target.value }
      return rackObj
    })
    setRacks(tempRacks)
  }

  const onChangeRow = (value, recordId, objVariable) => {
    const tempRacks = racks.map((rackObj) => {
      if (rackObj.key === activeKey) {
        const newShelfDataSource = rackObj.shelves.map((shelf) => {
          if (shelf.id === recordId)
            return {
              ...shelf,
              [objVariable]: objVariable === 'name' ? value : Number(value),
            }
          return shelf
        })

        return {
          ...rackObj,
          shelves: newShelfDataSource,
          noOfShelves: newShelfDataSource.length,
        }
      }

      return rackObj
    })

    setRacks(tempRacks)
  }

  const onSubmit = () => {
    setWarehouseNameError(undefined)
    setWarehouseLocationError(undefined)

    let isError = false
    if (!warehouseName) {
      isError = true
      setWarehouseNameError('Warehouse name cannot be empty')
    }
    if (!warehouseLocation) {
      isError = true
      setWarehouseLocationError('Warehouse location cannot be empty')
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

    upsertWarehouse({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        name: warehouseName,
        location: warehouseLocation,
        racks: racks.length
          ? racks.map(({ id: rackID, name, shelves, active }) => ({
              id: rackID,
              name,
              active,
              shelves: shelves.length
                ? shelves.map((shelfObj) => ({
                    id: shelfObj.id,
                    name: shelfObj.name,
                    length: shelfObj.length,
                    breadth: shelfObj.breadth,
                    height: shelfObj.height,
                    active: shelfObj.active,
                  }))
                : [],
            }))
          : [],
        deleted_racks: deletedRacks,
        deleted_shelves: deletedShelves,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/inventory/warehouses')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving warehouse.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readWarehouse')) return <Error403 />
  if (action === 'create' && !permissions.includes('createWarehouse')) return <Error403 />
  if (whErr) return `Error occured while fetching data: ${whErr.message}`

  return (
    <div>
      <Helmet title="Warehouses" />

      <Spin spinning={whLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Warehouse</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateWarehouse') ? (
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
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-3">
                  <strong>GENERAL DETAILS</strong>
                </h6>
                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Warehouse Name<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={warehouseName}
                      onChange={({ target: { value } }) => setWarehouseName(value)}
                      disabled={disabled}
                      className={
                        warehouseNameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{warehouseNameError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      Warehouse Location<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={warehouseLocation}
                      onChange={({ target: { value } }) => setWarehouseLocation(value)}
                      disabled={disabled}
                      className={
                        warehouseLocationError
                          ? 'custom-error-border'
                          : disabled
                          ? 'disabledStyle'
                          : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{warehouseLocationError || ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-3">
                  <strong>RACKS & SHELVES</strong>
                </h6>
                <div className="row">
                  <div className="col-lg-10">
                    <Button type="primary" className="mb-4" onClick={addRack}>
                      Add Rack
                    </Button>
                  </div>
                  {action === 'update' ? (
                    <div className="col-lg-2">
                      <PDFDownload id={id} />
                    </div>
                  ) : null}
                </div>
                <Tabs
                  hideAdd
                  onChange={(e) => setActiveKey(e)}
                  activeKey={activeKey}
                  type="editable-card"
                  onEdit={(targetKey) => removeRack(targetKey)}
                  className="mb-4"
                >
                  {racks.map((rack) => (
                    <TabPane tab={rack.name} key={rack.key} closable>
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="row">
                            <div className="col-lg-6">
                              <Input
                                addonBefore="Rack Name:"
                                onChange={(e) => onChangeRackProps(e, 'name')}
                                value={rack.name}
                              />
                            </div>
                            <div className="col-lg-6 pull-right">
                              <Button type="primary" onClick={addShelf}>
                                Add Shelf
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <br />

                      <div className="row">
                        <div className="col-lg-9">
                          <Table
                            key={new Date().getTime()}
                            columns={shelfColumns}
                            dataSource={rack.shelves}
                            bordered
                            rowKey={(record) => String(record.id)}
                            pagination={false}
                          />
                        </div>
                      </div>
                    </TabPane>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createWarehouse')) ||
          (action === 'update' && permissions.includes('updateWarehouse')) ? (
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

export default withRouter(connect(mapStateToProps)(WarehouseForm))
