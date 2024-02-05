import React, { useEffect, useState } from 'react'
import { Table, Collapse } from 'antd'
// import {  useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import moment from 'moment'
import CSVDownload from './csvDownload'
import { PRODUCT_COSTING_VERSION_HISTORY } from './queries'

const { Panel } = Collapse

const Versions = ({ product_id, versionCallback, data }) => {
  // const history = useHistory()
  const [versions, setVersions] = useState([])
  // const { product_id } = useParams()

  const {
    loading: pcvHistoryLoad,
    error: pcvHistoryErr,
    data: pcvHistoryData,
  } = useQuery(PRODUCT_COSTING_VERSION_HISTORY, { variables: { product_id } })

  useEffect(() => {
    if (
      !pcvHistoryLoad &&
      pcvHistoryData &&
      pcvHistoryData.productCostingVersionHistory &&
      pcvHistoryData.productCostingVersionHistory.length
    )
      setVersions(pcvHistoryData.productCostingVersionHistory)
  }, [pcvHistoryData, pcvHistoryLoad])

  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (text) => `Version ${text}`,
    },
    {
      title: 'Created Date ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY, h:mm A') : '-'),
    },
    {
      title: 'Change Notes',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) => text || '-',
    },
    {
      title: 'Created By',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '',
      dataIndex: '',
      key: 'csv',
      render: () => <CSVDownload data={data} />,
    },
  ]

  if (pcvHistoryErr) return `Error occured while fetching data: ${pcvHistoryErr.message}`

  return (
    <>
      <Collapse bordered>
        <Panel header="Versions History" key="1">
          <Table
            columns={columns}
            dataSource={versions}
            pagination={false}
            rowKey={(record) => String(record.id)}
            onRow={(record) => ({
              onClick: () => {
                if (versionCallback) versionCallback(record.version, true)
                // history.push(`/costing/${product_id}/${record.version}`)
                // localStorage.setItem('readOnly', true)
              },
            })}
            locale={{
              emptyText: (
                <div className="custom-empty-text-parent">
                  <div className="custom-empty-text-child">
                    <i className="fe fe-search" />
                    <h5>No Versions Found</h5>
                  </div>
                </div>
              ),
            }}
          />
        </Panel>
      </Collapse>
    </>
  )
}

export default Versions
