/* eslint no-unused-vars: off, no-undef:off */

import React, { useState, useEffect } from 'react'
import { Table, Image, Transfer, Spin, Select } from 'antd'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { EyeOutlined } from '@ant-design/icons'
import { PLANS_TO_TRANSFER } from '../../../queries'
import { PRODUCTS_BY_BRAND_ID } from '../../../../products/all-products/queries'

const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
  <Transfer {...restProps}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns

      const rowSelection = {
        getCheckboxProps: (item) => ({
          disabled: listDisabled || item.disabled,
        }),
        onSelectAll(selected, selectedRows) {
          console.log('selectedRows', selectedRows)
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key)
          const diffKeys = selected
            ? _.difference(treeSelectedKeys, listSelectedKeys)
            : _.difference(listSelectedKeys, treeSelectedKeys)
          onItemSelectAll(diffKeys, selected)
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected)
        },
        selectedRowKeys: listSelectedKeys,
      }

      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          style={{ pointerEvents: listDisabled ? 'none' : null }}
          onRow={({ key, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) return
              onItemSelect(key, !listSelectedKeys.includes(key))
            },
          })}
        />
      )
    }}
  </Transfer>
)

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

const TransferStep = ({ productsListCallback, transferPlanIDCallBack }) => {
  const { id, brand_id } = useParams()

  const [productsList, setProductList] = useState([])

  const [plansToTransferList, setPlansToTransferList] = useState([])

  const [transferPlanID, setTransferPlanID] = useState(undefined)
  const [transferPlan, setTransferPlan] = useState(undefined)

  const [targetKeys, setTargetKeys] = useState([])

  console.log('transferPlanID', transferPlanID)

  if (transferPlanIDCallBack) transferPlanIDCallBack(transferPlanID)

  const onChange = (nextTargetKeys) => {
    if (productsListCallback)
      productsListCallback(productsList.filter((e) => nextTargetKeys.includes(e.key)))

    setTargetKeys(nextTargetKeys)
  }

  const {
    loading: plansLoad,
    error: plansErr,
    data: plansData,
  } = useQuery(PLANS_TO_TRANSFER, {
    variables: { product_plan_id: id, brand_id },
  })

  useEffect(() => {
    if (!plansLoad && plansData && plansData.plansToTransfer && plansData.plansToTransfer.length)
      setPlansToTransferList(plansData.plansToTransfer)
    else setPlansToTransferList([])
  }, [plansData, plansLoad])

  const {
    loading: productLoad,
    error: productErr,
    data: productData,
  } = useQuery(PRODUCTS_BY_BRAND_ID, {
    variables: {
      product_plan_id: id,
      brand_id,
      includeType: true,
      plan_type: 'transfer',
      transfer_plan_id: transferPlanID,
    },
  })

  useEffect(() => {
    if (
      !productLoad &&
      productData &&
      productData.productsByBrandID &&
      productData.productsByBrandID.length
    )
      setProductList(productData.productsByBrandID.map((e) => ({ ...e, key: e.id })))
    else setProductList([])
  }, [productData, productLoad])

  if (productErr) return `Error occured while fetching data: ${productErr.message}`

  if (plansErr) return `Error occured while fetching data: ${plansErr.message}`

  return (
    <>
      <Spin spinning={plansLoad} tip="Loading..." size="large">
        {!transferPlanID ? (
          <div className="mt-4 ml-2">
            <div>Select a plan TO which you want to transfer</div>
            <Select
              showSearch
              value={transferPlanID}
              style={{ width: '100%' }}
              onChange={(value) => {
                setTransferPlanID(value)
                setTransferPlan(plansToTransferList.find((e) => value === e.id))
              }}
              placeholder="Choose One"
            >
              {plansToTransferList && plansToTransferList.length
                ? plansToTransferList.map((obj) => (
                    <Select.Option key={String(obj.id)} value={String(obj.id)}>
                      {`${obj.quarter} FY ${obj.year}-${(Number(obj.year) % 100) + 1}`}
                    </Select.Option>
                  ))
                : null}
            </Select>
          </div>
        ) : (
          <div className="mt-4">
            <TableTransfer
              dataSource={productsList}
              targetKeys={targetKeys}
              titles={[
                'From : Current Plan',
                `To :${transferPlan.quarter} FY ${transferPlan.year}-${
                  (Number(transferPlan.year) % 100) + 1
                }`,
              ]}
              onChange={onChange}
              filterOption={(inputValue, item) =>
                item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
              }
              leftColumns={tableColumns}
              rightColumns={tableColumns}
            />
          </div>
        )}
      </Spin>
    </>
  )
}

export default TransferStep
