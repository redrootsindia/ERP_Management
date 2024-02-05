/* eslint no-unused-vars: off, no-undef:off */

import React, { useState, useEffect } from 'react'
import { Table, Image, Spin } from 'antd'
import { useParams } from 'react-router-dom'

import { EyeOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { PRODUCTS_BY_BRAND_ID } from '../../../../products/all-products/queries'

const Exisitng = ({ productsListCallback }) => {
  const { id, brand_id } = useParams()

  const [productsList, setProductList] = useState([])

  const {
    loading: productLoad,
    error: productErr,
    data: productData,
  } = useQuery(PRODUCTS_BY_BRAND_ID, {
    variables: { product_plan_id: id, brand_id, includeType: true, plan_type: 'existing' },
  })

  useEffect(() => {
    if (
      !productLoad &&
      productData &&
      productData.productsByBrandID &&
      productData.productsByBrandID.length
    )
      setProductList(productData.productsByBrandID)
    else setProductList([])
  }, [productData, productLoad])

  const rowSelection = {
    onChange: (selectedRowKey, selectedRows) => {
      if (productsListCallback) productsListCallback(selectedRows)
    },
  }

  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
    },
    {
      title: 'Subcategory',
      dataIndex: 'product_subcategory',
      key: 'product_subcategory',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Hsn',
      dataIndex: 'hsn',
      key: 'hsn',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Est SP',
      dataIndex: 'sp',
      key: 'sp',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => {
        return {
          props: {
            style: {
              background: text === 'New' ? '#d3e68cb5' : '#ffe7bb',
              color: 'black',
            },
          },
          children: <b>{text || 0}</b>,
        }
      },
    },
  ]

  if (productErr) return `Error occured while fetching data: ${productErr.message}`

  return (
    <>
      <Spin spinning={productLoad} tip="Loading..." size="large">
        <div className="kit__utils__table">
          <Table
            columns={tableColumns}
            dataSource={productsList}
            pagination={false}
            rowKey={(record) => String(record.id)}
            rowSelection={rowSelection}
          />
        </div>
      </Spin>
    </>
  )
}

export default Exisitng
