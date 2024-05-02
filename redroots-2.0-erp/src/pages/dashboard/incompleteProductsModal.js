import React, { useState, useEffect } from 'react'
import { Modal, Table, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'

import { INCOMPLETE_PRODUCTS } from './queries'

const IncompleteProductsModal = () => {
  const [productsCount, setProductsCount] = useState(0)
  const [productsList, setProductsList] = useState([])

  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)

  const handleOk = () => setIsModalVisible(false)

  const handleCancel = () => setIsModalVisible(false)

  const {
    loading: productsLoad,
    error: productsErr,
    data: productsData,
  } = useQuery(INCOMPLETE_PRODUCTS)

  useEffect(() => {
    if (
      !productsLoad &&
      productsData &&
      productsData.incompleteProducts &&
      productsData.incompleteProducts.length
    ) {
      setProductsList(productsData.incompleteProducts)
      setProductsCount(productsData.incompleteProducts.length)
    }
  }, [productsData, productsLoad])

  if (productsErr) return `Error occured while fetching data: ${productsErr.message}`

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/products/all-products/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
      render: (text) => text || '-',
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text) => text || '-',
    },
    {
      title: 'Subcategory',
      dataIndex: 'subcategory_name',
      key: 'subcategory_name',
      render: (text) => text || '-',
    },
    {
      title: 'Missing Details',
      dataIndex: 'missing',
      key: 'missing',
      render: (text, record) => {
        const tempMissing = []
        record.missing.forEach((name) => {
          const innerArray = []
          name.split('_').forEach((e) => {
            innerArray.push(e.replace(e[0], e[0].toUpperCase()))
          })
          tempMissing.push(innerArray.join(' '))
        })
        return tempMissing.join(', ')
      },
    },
  ]

  return (
    <div>
      <div className="col-md-12">
        <div className="card">
          <Spin spinning={productsLoad} tip="Loading...">
            <div
              className="card-body overflow-hidden position-relative"
              role="button"
              aria-hidden="true"
              onClick={() => showModal()}
            >
              <div className="font-size-36 font-weight-bold text-dark line-height-1 mt-2">
                {productsCount}
              </div>
              <div className="mb-1">Incomplete Products</div>
            </div>
          </Spin>
        </div>
      </div>

      <Modal
        title="Incomplete Products"
        visible={isModalVisible}
        onOk={handleOk}
        centered
        width={700}
        onCancel={handleCancel}
      >
        <Table
          columns={tableColumns}
          dataSource={productsList}
          rowKey={(record) => String(record.id)}
          pagination={{
            defaultPageSize: 10,
          }}
        />
      </Modal>
    </div>
  )
}

export default IncompleteProductsModal
