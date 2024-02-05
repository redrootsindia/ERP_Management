// /* eslint no-unused-vars: "off" ,no-undef :"off" */
import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { Table, Image } from 'antd'
import { EyeOutlined } from '@ant-design/icons'

import { BATCH_DATA_BY_INWARD_ID } from './queries'

const RowExpand = ({ id }) => {
  const [expandMaterialInwardList, setExpandMaterialInwardList] = useState([])
  const {
    loading: expandMaterialInwardLoad,
    error: expandMaterialInwardErr,
    data: expandMaterialInwardData,
  } = useQuery(BATCH_DATA_BY_INWARD_ID, {
    variables: { inward_id: id },
  })

  useEffect(() => {
    if (
      !expandMaterialInwardLoad &&
      expandMaterialInwardData &&
      expandMaterialInwardData.batchDataByInwardID &&
      expandMaterialInwardData.batchDataByInwardID.length
    ) {
      setExpandMaterialInwardList(expandMaterialInwardData.batchDataByInwardID)
    }
  }, [expandMaterialInwardData, expandMaterialInwardLoad, id])

  if (expandMaterialInwardErr)
    return `Error occured while fetching data: ${expandMaterialInwardErr.message}`

  const batchColumns = [
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
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Batch Number',
      dataIndex: 'id',
      key: 'id',
      render: (text) => `# ${text}`,
    },
    {
      title: 'Material Code ',
      dataIndex: 'material_code',
      key: 'material_code',
    },
    {
      title: 'Material Name ',
      dataIndex: 'material_name',
      key: 'material_name',
    },
    {
      title: 'Recived Qty. ',
      dataIndex: 'quantity',
      key: 'quantity',
    },
  ]

  return (
    <div className="kit__utils__table ml-4">
      <Table
        columns={batchColumns}
        dataSource={expandMaterialInwardList}
        pagination={false}
        onHeaderRow={() => ({ className: 'custom-header-small-font' })}
        rowKey={(record) => String(record.id)}
      />
    </div>
  )
}
export default RowExpand
