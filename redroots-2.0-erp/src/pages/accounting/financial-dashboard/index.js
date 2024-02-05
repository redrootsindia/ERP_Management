import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { Spin, Select, Input, Button, Cascader } from 'antd'
import { RightOutlined } from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import { connect } from 'react-redux'

const mapStateToProps = ({ user }) => ({ user })

const FinancialDashboard = ({ user: { permissions } }) => {
  const { Option } = Select
  //   const { Panel } = Collapse
  //   const onChange = (value) => {
  //     console.log(`selected ${value}`)
  //   }

  //   const onSearch = () => {
  //     console.log('search:', value)
  //   }

  const options = [
    {
      value: 'test',
      label: 'test',
    },
    {
      value: 'ajio',
      label: 'ajio',
    },
  ]

  if (!permissions.includes('readFinancialDashboard')) return <Error403 />
  return (
    <>
      <div>
        <Helmet title="Financial Dashboard" />

        <Spin spinning={false} tip="Loading..." size="large">
          <div>
            <div className="row">
              <div className="col-md-6">
                <div className="row mx-2 mb-3">
                  <h3>Financial Dashboard</h3>
                  <div className="col-md-6 col-12">
                    <Select
                      showSearch
                      placeholder="Select Vendors Codes"
                      optionFilterProp="children"
                      style={{ width: '100%' }}
                      //   onChange={onChange}
                      //   onSearch={onSearch}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="tom">Tom</Option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="row">
                  <div className="col-12 col-md-12">
                    <div className="d-flex">
                      <Input
                        addonAfter={
                          <Cascader
                            placeholder="all category"
                            style={{
                              width: 100,
                              background: 'white',
                              border: '1',
                              textAlign: 'center',
                              margin: '-12px -8px',
                            }}
                            options={options}
                          />
                        }
                        // defaultValue="mysite"
                        placeholder="enter invoice number or payment number"
                      />
                      <Button>Search</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="w-100 card mb-1">
                  <div className="card-body col-4">
                    <h4 className="mb-2">OPEN BUSINESS ACROSS CURRENCIES</h4>
                    <Input prefix="INR" suffix="200.00" readOnly />
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h4 className="text-center">Total Estimate : 00.00 INR</h4>
                  </div>
                  <div className="card-body pt-0">
                    <div className="row text-center">
                      <div className="col-md-3 p-0">
                        <div className="card h-100">
                          <div className="card-header py-1 mb-2">YOUR RECEIVABLES</div>
                          <div className="card-body">
                            <h3 className="mb-4">0.00 INR</h3>
                            <div className="row">
                              <div className="col-6 p-0 border-right ">
                                <span>IN PROGRESS</span>
                                <h5>0.00 INR</h5>
                              </div>
                              <div className="col-6 p-0">
                                <span>READY FOR PAYMENT</span>
                                <h5>0.00 INR</h5>
                              </div>
                            </div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-6">
                              <a href="#">View details</a>
                            </div>
                            <div className="col-6">
                              <a href="#">View details</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 p-0">
                        <div className="card h-100">
                          <div className="card-header py-1 mb-2">YOUR PAYABLES</div>
                          <div className="card-body ">
                            <h3 className="mb-4">0.00 INR</h3>
                            <div className="d-flex row">
                              <div className="col p-0 border-right">
                                <span>IN PROGRESS</span>
                                <h5>0.00 INR</h5>
                              </div>
                              <div className="col p-0">
                                <div>
                                  <span>READY FOR PAYMENT</span>
                                  <h4>0.00 INR</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-6">
                              <a href="#">View details</a>
                            </div>
                            <div className="col-6">
                              <a href="#">View details</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 p-0">
                        <div className="card h-100">
                          <div className="card-header py-1 mb-2">ADJUSTMENTS</div>
                          <div className="card-body ">
                            <h3 className="mb-4">0.00 INR</h3>
                          </div>
                          <div className="row mb-2">
                            <div className="col-12">
                              <a href="#">View details</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 p-0">
                        <div className="card h-100">
                          <div className="card-header py-1 mb-2">OPEN CASH/CREDIT</div>
                          <div className="card-body ">
                            <h3 className="mb-4">0.00 INR</h3>
                          </div>
                          <div className="row mb-2">
                            <div className="col-12">
                              <a href="#">View details</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row text-center mb-4">
                  <div className="col-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h3>Net receivables</h3>
                        <p>The Amount which is approved and ready to be paid to you</p>
                        <h3>0.00 INR</h3>
                        <a href="#">Show Breakdown</a>
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h3>Payments</h3>
                        <p>Total Amount of Payment release in last 15 days</p>
                        <h3>0.00 INR</h3>
                        <a href="#">View Details</a>
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h3>Account Balance</h3>
                        {/* <p>Total Amount of Payment release in last 15 days</p> */}
                        <h3>0.00 INR</h3>
                        <a href="#">View Details</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card px-2">
                  <div className="row">
                    <div className="col-md-10 col-12">
                      <h3 className="py-3">Required actions</h3>
                      <div className="row">
                        <div className="col-6">
                          <div className="card">
                            <div className="card-body">
                              <div className="row justify-content-start">
                                <div className="col-10 offset-2 ">
                                  <strong className="font-size-24 px-0">Your receivable</strong>
                                </div>
                              </div>
                              <div className="row justify-content-start">
                                <div className="col-2 font-size-24">0</div>
                                <div className="col-10">
                                  Missing Proof of delivery
                                  <br /> submit proof of delivery for identified shortages
                                </div>
                              </div>
                              <hr />
                              <div className="row justify-content-start">
                                <div className="col-2 font-size-24">0</div>
                                <div className="col-10">
                                  Proof of delivery Rejected
                                  <br /> review proof of delivery for resubmission
                                </div>
                              </div>
                              <hr />
                              <div className="row justify-content-start">
                                <div className="col-2 font-size-24">0</div>
                                <div className="col-10">
                                  credits notes rejected
                                  <br /> Review and resubmit credit notes
                                </div>
                              </div>
                              <hr />
                              <div className="row justify-content-start">
                                <div className="col-2 font-size-24">0</div>
                                <div className="col-10">
                                  Invoice rejected
                                  <br /> Review and resubmit invoice
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="card">
                            <div className="card-body">
                              <div className="row justify-content-start">
                                <div className="col-10 offset-2 ">
                                  <strong className="font-size-24 px-0">Your Payable</strong>
                                </div>
                              </div>
                              <div className="row justify-content-start">
                                <div className="col-2 font-size-24">0</div>
                                <div className="col-10">
                                  Rabets,incentives,and coOp <br />
                                  aggrement pending acceptance
                                  <br />
                                  Accept/reject aggrement
                                </div>
                              </div>
                              <hr />
                              <div className="row justify-content-start">
                                <div className="col-2 font-size-24">0</div>
                                <div className="col-10">
                                  Rabets,incentives,and coOp
                                  <br /> aggrement pending Billings
                                  <br /> Enter reconcilation amount
                                </div>
                              </div>
                              <hr />
                              <div className="row justify-content-start">
                                <div className="col-2 font-size-24">0</div>
                                <div className="col-10">
                                  <p>
                                    Product Return request pending <br />
                                    Authorization <br />
                                    authorize product retun
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 col-12">
                      <h3 className="py-3">Your Disputes</h3>
                      <div className="row">
                        <div className="col-12 ">
                          <div className="d-flex mb-4 justify-content-center align-items-center">
                            <div className="text-center">
                              <h3>0</h3>
                              <p>Dispute</p>
                            </div>
                          </div>
                          <div className="list-item">
                            <ul>
                              <li>Pending System Actions(0)</li>
                              <li>Pending your Actions(0)</li>
                              <li>Submitted(0)</li>
                            </ul>
                          </div>
                          <hr />
                          <div className="recommandation mb-3">
                            <h3>Recommendation</h3>
                            <div>
                              <ul className="list-inline">
                                <li>
                                  <Link to="#">
                                    <RightOutlined />
                                    Draft Invoice(0)
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <RightOutlined />
                                    Draft dispute(0)
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div className="quick-links mb-3 ">
                            <hr />
                            <h3>Quick Links</h3>
                            <div>
                              <ul className="list-inline">
                                <li>
                                  <Link to="#">
                                    <RightOutlined />
                                    Create an Invoice
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <RightOutlined />
                                    Create a dispute
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <RightOutlined />
                                    Create a case
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <RightOutlined />
                                    CoOp agreement
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#">
                                    <RightOutlined />
                                    Purchasing terms
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </>
  )
}

export default withRouter(connect(mapStateToProps)(FinancialDashboard))
