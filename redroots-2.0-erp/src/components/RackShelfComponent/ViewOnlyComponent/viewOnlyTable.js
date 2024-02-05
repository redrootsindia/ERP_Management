import React from 'react'
import { Table } from 'antd'
import './style.scss'

class ViewRackShelfData extends React.Component {
  constructor(props) {
    super(props)

    this.columns = [
      {
        title: 'Rack',
        key: 'rackID',
        dataIndex: 'rackID',
        width: '35%',
        sort: false,
        filter: false,
        type: 'string',
      },
      {
        title: 'Shelf',
        key: 'shelfID',
        dataIndex: 'shelfID',
        width: '35%',
        sort: false,
        filter: false,
        type: 'string',
      },
      {
        title: 'Quantity',
        key: 'quantity',
        dataIndex: 'quantity',
        sort: false,
        filter: false,
        type: 'number',
      },
    ]
  }

  render() {
    const { tableData } = this.props

    // console.log("tableData in Props: ", tableData);

    return <Table columns={this.columns} dataSource={tableData} pagination={false} scroll={false} />
  }
}

export default ViewRackShelfData
