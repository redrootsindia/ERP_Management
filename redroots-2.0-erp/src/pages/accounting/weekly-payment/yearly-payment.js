import { Table } from 'antd'
import React from 'react'

const Yearly = ({ vendorcolumns, buyercolumns }) => {
  return (
    <div>
      <div className="row">
        <div className="col-lg-6">
          <h3>Yearly</h3>
          <Table columns={vendorcolumns} />
        </div>
        <div className="col-lg-6">
          <h3>Yearly</h3>
          <Table columns={buyercolumns} />
        </div>
      </div>
    </div>
  )
}

export default Yearly
