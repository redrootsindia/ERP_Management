import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification, InputNumber } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ImageUpload from 'components/ImageUpload'
import Error403 from 'components/Errors/403'
import { UOMS } from '../../settings/misc/uom/queries'
import {
  MATERIAL,
  UPSERT_MATERIAL,
  MATERIAL_COLORS,
  MATERIAL_CATEGORIES,
  MATERIAL_SUBCATEGORY_BY_CATEGORY_ID,
} from './queries'

const mapStateToProps = ({ user }) => ({ user })

const MaterialForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)

  const [image, setImage] = useState(undefined)
  const [existingImages, setExistingImages] = useState([])
  const [imageChanged, setImageChanged] = useState(false)

  const [colorID, setColorID] = useState(undefined)
  const [colorIDError, setColorIDError] = useState(undefined)
  const [colorsList, setColorsList] = useState([])

  const [categoryID, setCategoryID] = useState(undefined)
  const [categoryIDError, setCategoryIDError] = useState(undefined)
  const [categoriesList, setCategoriesList] = useState([])

  const [subcategoryID, setSubcategoryID] = useState(undefined)
  const [subcategoryIDError, setSubcategoryIDError] = useState(undefined)
  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [uomID, setUOMID] = useState(undefined)
  const [uomIDError, setUOMIDError] = useState(undefined)
  const [uomList, setUOMList] = useState([])

  const [materialCode, setMaterialCode] = useState(undefined)
  const [materialCodeError, setMaterialCodeError] = useState(undefined)
  const [pricePerUOM, setPricePerUOM] = useState(0)
  const [pricePerUOMError, setPricePerUOMError] = useState(undefined)
  const [panna, setPanna] = useState(0)
  const [pannaError, setPannaError] = useState(undefined)
  const [moq, setMOQ] = useState(0)
  const [moqError, setMOQError] = useState(undefined)
  const [msq, setMSQ] = useState(0)
  const [msqError, setMSQError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateMaterial')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertMaterial] = useMutation(UPSERT_MATERIAL)

  const { loading: colorLoad, error: colorErr, data: colorData } = useQuery(MATERIAL_COLORS)
  const { loading: catLoad, error: catErr, data: catData } = useQuery(MATERIAL_CATEGORIES)
  const { loading: uomLoad, error: uomErr, data: uomData } = useQuery(UOMS)

  const { loading: subcatLoad, error: subcatErr, data: subcatData } = useQuery(
    MATERIAL_SUBCATEGORY_BY_CATEGORY_ID,
    {
      variables: { material_category_id: categoryID },
    },
  )

  const { loading: materialLoad, error: materialErr, data: materialData } = useQuery(MATERIAL, {
    variables: { id },
  })

  useEffect(() => {
    if (materialData && materialData.material) {
      // prettier-ignore
      const { material_color_id, material_category_id, material_subcategory_id, uom_id } = materialData.material

      if (materialData.material.name) setName(materialData.material.name)

      if (material_color_id) setColorID(String(material_color_id))
      if (material_category_id) setCategoryID(String(material_category_id))
      if (material_subcategory_id) setSubcategoryID(String(material_subcategory_id))
      if (uom_id) setUOMID(String(uom_id))

      setMaterialCode(materialData.material.material_code)
      setPricePerUOM(materialData.material.price_per_uom)
      setPanna(materialData.material.panna)
      setMOQ(materialData.material.moq)
      setMSQ(materialData.material.msq)

      if (materialData.material.image) {
        setImage(materialData.material.image)
        setExistingImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_MATERIAL_URL}${materialData.material.image}`,
        ])
      }
    }
  }, [materialData])

  useEffect(() => {
    if (!uomLoad && uomData && uomData.uoms && uomData.uoms.length) setUOMList(uomData.uoms)
  }, [uomData, uomLoad])

  useEffect(() => {
    if (!colorLoad && colorData && colorData.materialColors && colorData.materialColors.length)
      setColorsList(colorData.materialColors)
  }, [colorData, colorLoad])

  useEffect(() => {
    if (!catLoad && catData && catData.materialCategories && catData.materialCategories.length)
      setCategoriesList(catData.materialCategories)
  }, [catData, catLoad])

  // prettier-ignore
  useEffect(() => {
    if (subcatData && subcatData.materialSubcategoryByCategoryID && subcatData.materialSubcategoryByCategoryID.length)
      setSubcategoriesList(subcatData.materialSubcategoryByCategoryID)
  }, [subcatData])

  const onSubmit = () => {
    setNameError(undefined)
    setColorIDError(undefined)
    setCategoryIDError(undefined)
    setSubcategoryIDError(undefined)
    setUOMIDError(undefined)
    setMaterialCodeError(undefined)
    setPricePerUOMError(undefined)
    setPannaError(undefined)
    setMOQError(undefined)
    setMSQError(undefined)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Material name cannot be empty')
    }
    if (!colorID || Number(colorID) === 0) {
      isError = true
      setColorIDError('Please select a color')
    }
    if (!categoryID || Number(categoryID) === 0) {
      isError = true
      setCategoryIDError('Please select a category')
    }
    if (!subcategoryID || Number(subcategoryID) === 0) {
      isError = true
      setSubcategoryIDError('Please select a subcategory')
    }
    if (!uomID || Number(uomID) === 0) {
      isError = true
      setUOMIDError('Please select the unit of measurement')
    }
    if (!materialCode) {
      isError = true
      setMaterialCodeError('Material code cannot be empty')
    }
    if (Number(pricePerUOM < 0)) {
      isError = true
      setPricePerUOMError('Price Per UOM should be a positive number')
    }
    if (Number(panna < 0)) {
      isError = true
      setPannaError('Panna should be a positive number')
    }
    if (Number(moq < 0)) {
      isError = true
      setMOQError('MOQ should be a positive number')
    }
    if (Number(msq < 0)) {
      isError = true
      setMOQError('MSQ should be a positive number')
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

    upsertMaterial({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        name,
        material_color_id: Number(colorID),
        material_category_id: Number(categoryID),
        material_subcategory_id: Number(subcategoryID),
        price_per_uom: Number(pricePerUOM),
        material_code: materialCode,
        panna: Number(panna),
        moq: Number(moq),
        msq: Number(msq),
        uom_id: Number(uomID),
        image,
        is_image_changed: imageChanged,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/materials/all-materials')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving material.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readMaterial')) return <Error403 />
  if (action === 'create' && !permissions.includes('createMaterial')) return <Error403 />
  if (materialErr) return `Error occured while fetching data: ${materialErr.message}`
  if (uomErr) return `Error occured while fetching data: ${uomErr.message}`
  if (colorErr) return `Error occured while fetching data: ${colorErr.message}`
  if (catErr) return `Error occured while fetching data: ${catErr.message}`
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`

  return (
    <div>
      <Helmet title="Materials" />

      <Spin spinning={materialLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Material</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateMaterial') ? (
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
            <div className="row">
              <div className="col-10">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Material Name<span className="custom-error-text"> *</span>
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
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      Material Code<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={materialCode}
                      onChange={({ target: { value } }) => setMaterialCode(value)}
                      disabled={disabled}
                      className={
                        materialCodeError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{materialCodeError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      UOM<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={uomID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setUOMID(value)}
                      className={
                        uomIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select a UOM"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {uomList && uomList.length
                        ? uomList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{uomIDError || ''}</div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Material Category<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={categoryID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setCategoryID(value)}
                      className={
                        categoryIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select a category"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {categoriesList && categoriesList.length
                        ? categoriesList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{categoryIDError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      Material Subcategory<span className="custom-error-text"> *</span>
                    </div>
                    {categoryID ? (
                      subcatLoad ? (
                        <div>Loading ...</div>
                      ) : (
                        <Select
                          showSearch
                          value={subcategoryID}
                          disabled={disabled}
                          style={{ width: '100%' }}
                          onChange={(value) => setSubcategoryID(value)}
                          className={
                            subcategoryIDError
                              ? 'custom-error-border'
                              : disabled
                              ? 'disabledStyle'
                              : ''
                          }
                          placeholder="Select a subcategory"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {subcategoriesList && subcategoriesList.length
                            ? subcategoriesList.map((obj) => (
                                <Select.Option key={String(obj.id)} value={String(obj.id)}>
                                  {obj.name}
                                </Select.Option>
                              ))
                            : null}
                        </Select>
                      )
                    ) : (
                      <div>(Please select a category first)</div>
                    )}
                    <div className="custom-error-text mb-4">{subcategoryIDError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      Color<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={colorID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setColorID(value)}
                      className={
                        colorIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select a color"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {colorsList && colorsList.length
                        ? colorsList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{colorIDError || ''}</div>
                  </div>

                  <div className="col-lg-2">
                    <div className="mb-2">
                      Price Per UOM<span className="custom-error-text"> *</span>
                    </div>
                    <InputNumber
                      value={pricePerUOM}
                      onChange={(value) => setPricePerUOM(value)}
                      disabled={disabled}
                      className={
                        pricePerUOMError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      style={{ width: '100%' }}
                    />
                    <div className="custom-error-text mb-4">{pricePerUOMError || ''}</div>
                  </div>

                  <div className="col-lg-2">
                    <div className="mb-2">
                      Panna<span className="custom-error-text"> *</span>
                    </div>
                    <InputNumber
                      value={panna}
                      onChange={(value) => setPanna(value)}
                      disabled={disabled}
                      className={
                        pannaError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      style={{ width: '100%' }}
                    />
                    <div className="custom-error-text mb-4">{pannaError || ''}</div>
                  </div>

                  <div className="col-lg-2">
                    <div className="mb-2">
                      MOQ<span className="custom-error-text"> *</span>
                    </div>
                    <InputNumber
                      value={moq}
                      onChange={(value) => setMOQ(value)}
                      disabled={disabled}
                      className={moqError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                      style={{ width: '100%' }}
                    />
                    <div className="custom-error-text mb-4">{moqError || ''}</div>
                  </div>

                  <div className="col-lg-2">
                    <div className="mb-2">
                      MSQ<span className="custom-error-text"> *</span>
                    </div>
                    <InputNumber
                      value={msq}
                      onChange={(value) => setMSQ(value)}
                      disabled={disabled}
                      className={msqError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                      style={{ width: '100%' }}
                    />
                    <div className="custom-error-text mb-4">{msqError || ''}</div>
                  </div>
                </div>
              </div>

              <div className="col-2">
                <div className="mb-2">Image</div>
                <ImageUpload
                  existingImages={existingImages} // Always pass an array. If not empty, it should have fully-formed URLs of images
                  placeholderType="general" // Accepted values: 'general' or 'general'
                  onUploadCallback={(imgFile) => {
                    setImage(imgFile)
                    setImageChanged(true)
                  }}
                  onRemoveCallback={() => {
                    setImage(null)
                    setImageChanged(true)
                  }}
                  maxImages={1}
                  editMode={!disabled}
                />
                <div className="mb-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createMaterial')) ||
          (action === 'update' && permissions.includes('updateMaterial')) ? (
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

export default withRouter(connect(mapStateToProps)(MaterialForm))
