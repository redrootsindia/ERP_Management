import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Select, Button, Table, Spin, Image, Switch, Pagination, notification } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import {
  MATERIALS,
  MATERIAL_CATEGORIES,
  MATERIAL_SUBCATEGORIES,
  MATERIAL_COLORS,
  CHANGE_STATUS,
} from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const Materials = ({ user: { permissions } }) => {
  const [materialCategoryIDs, setMaterialCategoryIDs] = useState([])
  const [materialCategoriesList, setMaterialCategoriesList] = useState([])
  const [materialSubcategoryIDs, setMaterialSubcategoryIDs] = useState([])
  const [materialSubcategoriesList, setMaterialSubcategoriesList] = useState([])
  const [materialColorIDs, setMaterialColorIDs] = useState([])
  const [materialColorsList, setMaterialColorsList] = useState([])

  const [materials, setMaterials] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('nameAsc')
  const [statusFilter, setStatusFilter] = useState(null)
  const [searchString, setSearchString] = useState('')

  const [changeStatus] = useMutation(CHANGE_STATUS)

  const {
    loading: materialCategoryLoad,
    error: materialCategoryErr,
    data: materialCategoryData,
  } = useQuery(MATERIAL_CATEGORIES)

  const {
    loading: materialSubcategoryLoad,
    error: materialSubcategoryErr,
    data: materialSubcategoryData,
  } = useQuery(MATERIAL_SUBCATEGORIES)

  const { loading: materialColorLoad, error: materialColorErr, data: materialColorData } = useQuery(
    MATERIAL_COLORS,
  )

  const { loading: materialLoad, error: materialErr, data: materialData } = useQuery(MATERIALS, {
    variables: {
      materialCategoryIDs,
      materialSubcategoryIDs,
      materialColorIDs,
      statusFilter,
      searchString,
      sortBy,
      limit,
      offset,
    },
  })

  useEffect(() => {
    if (
      materialData &&
      materialData.materials &&
      materialData.materials.rows &&
      materialData.materials.rows.length
    ) {
      setMaterials(materialData.materials.rows)
      setRecordCount(materialData.materials.count)
    } else {
      setMaterials([])
      setRecordCount(0)
    }
  }, [materialData])

  useEffect(() => {
    if (
      !materialCategoryLoad &&
      materialCategoryData &&
      materialCategoryData.materialCategories &&
      materialCategoryData.materialCategories.length
    )
      setMaterialCategoriesList(materialCategoryData.materialCategories)
  }, [materialCategoryData, materialCategoryLoad])

  useEffect(() => {
    if (
      !materialSubcategoryLoad &&
      materialSubcategoryData &&
      materialSubcategoryData.materialSubcategories &&
      materialSubcategoryData.materialSubcategories.length
    )
      setMaterialSubcategoriesList(materialSubcategoryData.materialSubcategories)
  }, [materialSubcategoryData, materialSubcategoryLoad])

  useEffect(() => {
    if (
      !materialColorLoad &&
      materialColorData &&
      materialColorData.materialColors &&
      materialColorData.materialColors.length
    )
      setMaterialColorsList(materialColorData.materialColors)
  }, [materialColorData, materialColorLoad])

  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_MATERIAL_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="material-image"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'material_code',
      key: 'material_code',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/materials/all-materials/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'material_category_name',
      key: 'material_category_name',
    },
    {
      title: 'Sub Category',
      dataIndex: 'material_subcategory_name',
      key: 'material_subcategory_name',
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) =>
        permissions.includes('updateMaterial') ? (
          <Switch
            defaultChecked={active}
            onChange={(checked) =>
              changeStatus({ variables: { id: record.id, status: checked } })
                .then(() =>
                  notification.success({
                    description: (
                      <span>
                        Status of <strong>{record.name}</strong> changed successfully
                      </span>
                    ),
                  }),
                )
                .catch((err) => {
                  notification.error({
                    message: 'Error occured while changing status.',
                    description: err.message || 'Please contact system administrator.',
                  })
                })
            }
            disabled={!permissions.includes('updateMaterial')}
          />
        ) : active ? (
          'Yes'
        ) : (
          'No'
        ),
    },
  ]

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  if (!permissions.includes('readMaterial')) return <Error403 />
  if (materialColorErr) return `Error occured while fetching data: ${materialColorErr.message}`
  if (materialErr) return `Error occured while fetching data: ${materialErr.message}`
  if (materialCategoryErr)
    return `Error occured while fetching data: ${materialCategoryErr.message}`
  if (materialSubcategoryErr)
    return `Error occured while fetching data: ${materialSubcategoryErr.message}`

  return (
    <div>
      <Helmet title="Materials" />

      <Spin spinning={materialLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>MATERIALS</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createMaterial') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/materials/all-materials/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}

                  <div className="col-lg-9 custom-pad-r0">
                    <Select
                      mode="multiple"
                      value={materialCategoryIDs || []}
                      style={{ width: '20%' }}
                      onChange={(value) => setMaterialCategoryIDs(value)}
                      placeholder="Filter by material categories"
                      className="custom-pad-r1"
                    >
                      {materialCategoriesList && materialCategoriesList.length
                        ? materialCategoriesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>

                    <Select
                      mode="multiple"
                      value={materialSubcategoryIDs || []}
                      style={{ width: '20%' }}
                      onChange={(value) => setMaterialSubcategoryIDs(value)}
                      placeholder="Filter by material sub categories"
                      className="custom-pad-r1"
                    >
                      {materialSubcategoriesList && materialSubcategoriesList.length
                        ? materialSubcategoriesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>

                    <Select
                      mode="multiple"
                      value={materialColorIDs || []}
                      style={{ width: '20%' }}
                      onChange={(value) => setMaterialColorIDs(value)}
                      placeholder="Filter by material colors"
                      className="custom-pad-r1"
                    >
                      {materialColorsList && materialColorsList.length
                        ? materialColorsList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>

                    <Select
                      key="statusFilter"
                      value={statusFilter || null}
                      style={{ width: '14%' }}
                      placeholder="Filter by active"
                      onChange={(active) => setStatusFilter(active)}
                      className="custom-pad-r1"
                    >
                      <Option key={0} value={null}>
                        All statuses
                      </Option>
                      <Option key={1} value="active">
                        Active only
                      </Option>
                      <Option key={2} value="inactive">
                        Inactive only
                      </Option>
                    </Select>

                    <Select
                      key="sortBy"
                      value={sortBy || 'nameAsc'}
                      style={{ width: '25%' }}
                      placeholder="Sort by name - A to Z"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="nameAsc" value="nameAsc">
                        Sort by name - A to Z
                      </Option>
                      <Option key="nameDesc" value="nameDesc">
                        Sort by name - Z to A
                      </Option>
                      <Option key="dateDesc" value="dateDesc">
                        Sort by created date - Latest first
                      </Option>
                      <Option key="dateAsc" value="dateAsc">
                        Sort by created date - Oldest first
                      </Option>
                    </Select>
                  </div>

                  <div className="col-lg-2">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search"
                      onChange={({ target: { value } }) => debouncedInputSearch(value)}
                      allowClear
                    />
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={materials}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Materials Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                  />
                  <Pagination
                    current={currentPage}
                    showTotal={(total) => `Total ${total} items`}
                    total={recordCount}
                    pageSize={pageSize}
                    pageSizeOptions={[20, 50, 100]}
                    className="custom-pagination"
                    onChange={(page) => {
                      setCurrentPage(page)
                      setOffset((page - 1) * limit)
                    }}
                    showSizeChanger
                    onShowSizeChange={(current, selectedSize) => {
                      setPageSize(selectedSize)
                      setCurrentPage(1)
                      setLimit(selectedSize)
                      setOffset(0)
                    }}
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

export default withRouter(connect(mapStateToProps)(Materials))
