import { Table } from 'antd'
import React from 'react'

const Monthly = ({ vendorcolumns, buyercolumns, vendordata, buyerdata }) => {
  return (
    <div>
      <div className="row">
        <div className="col-lg-6">
          <div className="closing-data">
            <div className="row ">
              <div className="col-lg-12  font-size-32">
                Opening Balance : &#8377;
                <span>
                  {vendordata
                    ? vendordata.reduce((acc, obj) => acc + obj.total_amount, 0).toFixed(2)
                    : 0.0}
                </span>
              </div>
            </div>
          </div>
          <h3>Monthly</h3>
          <Table columns={vendorcolumns} dataSource={vendordata} />
        </div>
        <div className="col-lg-6">
          <div className="closing-data">
            <div className="row ">
              {/* <div className="col-lg-12 font-size-18">Closing Balance</div> */}

              <div className="col-lg-12  font-size-32">
                Closing Balance : &#8377;
                <span>
                  {buyerdata.reduce((acc, obj) => acc + obj.total_amount, 0).toFixed(2) -
                    vendordata.reduce((acc, obj) => acc + obj.total_amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <h3>Monthly</h3>
          <Table columns={buyercolumns} dataSource={buyerdata} />
        </div>
      </div>
    </div>
  )
}

export default Monthly
