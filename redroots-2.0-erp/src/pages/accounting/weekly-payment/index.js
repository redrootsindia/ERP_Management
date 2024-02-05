import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Input, Spin, DatePicker, Select, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import { Link, withRouter } from 'react-router-dom'
import moment from 'moment'
import { useQuery } from '@apollo/client'
// import { BRANDS } from 'pages/purchase-orders/product/queries'
import { WEEKLY_PAYMENT_TO_VENDORS, WEEKLY_PAYMENT_FROM_BUYER, ORGANIZATION } from './query'
import Monthly from './monthly-payment'
import Yearly from './yearly-payment'

const { RangePicker } = DatePicker
const mapStateToProps = ({ user }) => ({ user })
const WeeklyPayment = ({ user: { permissions } }) => {
  const [dateRange, setDateRange] = useState([])
  const dueDateFilter = dateRange.map((e) => String(moment(e, 'Do MMM YYYY').valueOf()))
  // const [brandList, setBrandList] = useState([])
  const [companyID, setCompanyID] = useState(undefined)
  const [companyList, setCompanyList] = useState([])
  const [view, setView] = useState('Weekly')
  const [firstWeek, setFirstWeek] = useState([])
  const [secondWeek, setSecondWeek] = useState([])
  const [thirdWeek, setthirdWeek] = useState([])
  const [fourthWeek, setFourthWeek] = useState([])
  const [fifthWeek, setFifthWeek] = useState([])
  const [sixthWeek, setSixthWeek] = useState([])

  const [buyerFirstWeek, setBuyerFirstWeek] = useState([])
  const [buyerSecondWeek, setBuyerSecondWeek] = useState([])
  const [buyerThirdWeek, setBuyerThirdWeek] = useState([])
  const [buyerFourthdWeek, setBuyerFourthdWeek] = useState([])
  const [buyerFifthdWeek, setBuyerFifthdWeek] = useState([])
  const [buyerSixthWeek, setBuyerSixthWeek] = useState([])

  const [vendorMonthlyData, setVendorMonthlyData] = useState([])

  const {
    loading: weeklyPaymentToVendorLoad,
    data: weeklyPaymentToVendorData,
    error: weeklyPaymentToVendorError,
  } = useQuery(WEEKLY_PAYMENT_TO_VENDORS, {
    variables: {
      // companyIDs: companyID,
      dueDateFilter,
    },
  })

  const {
    loading: weeklyPaymentFromBuyerLoad,
    data: weeklyPaymentFromBuyerData,
    error: weeklyPaymentFromBuyerError,
  } = useQuery(WEEKLY_PAYMENT_FROM_BUYER, {
    variables: {
      // companyIDs: companyID,
      dueDateFilter,
    },
  })
  const { loading: companyLoad, error: companyErr, data: companyData } = useQuery(ORGANIZATION)

  useEffect(() => {
    if (
      !companyLoad &&
      companyData &&
      companyData.organizations &&
      companyData.organizations.length
    ) {
      setCompanyList(companyData.organizations)
    }
  }, [companyLoad, companyLoad])

  useEffect(() => {
    if (
      !weeklyPaymentToVendorLoad &&
      weeklyPaymentToVendorData &&
      weeklyPaymentToVendorData.weeklyPaymentPurchaseBills &&
      weeklyPaymentToVendorData.weeklyPaymentPurchaseBills.rows &&
      weeklyPaymentToVendorData.weeklyPaymentPurchaseBills.rows.length
    ) {
      const week1 = []
      const week2 = []
      const week3 = []
      const week4 = []
      const week5 = []
      const week6 = []
      const monthFilter = weeklyPaymentToVendorData.weeklyPaymentPurchaseBills.rows.filter(
        (obj) => {
          return moment(Number(obj.due_date)).month() === moment().month()
        },
      )
      setVendorMonthlyData(monthFilter)
      weeklyPaymentToVendorData.weeklyPaymentPurchaseBills.rows.forEach((el) => {
        const currmonth = moment().month()
        const month = moment(Number(el.due_date)).month()
        const year = moment(Number(el.due_date)).year()
        const curryear = moment().year()
        const week = Math.ceil((moment(Number(el.due_date)).week() % 7) - 1)
        switch (week) {
          case 1:
            if (currmonth === month && year === curryear) {
              week1.push(el)
            }
            break
          case 2:
            if (currmonth === month && year === curryear) {
              week2.push(el)
            }
            break
          case 3:
            if (currmonth === month && year === curryear) {
              week3.push(el)
            }
            break
          case 4:
            if (currmonth === month && year === curryear) {
              week4.push(el)
            }
            break
          case 5:
            if (currmonth === month && year === curryear) {
              week5.push(el)
            }
            break
          case 6:
            if (currmonth === month && year === curryear) {
              week6.push(el)
            }
            break
          default:
            console.log('')
        }
      })
      setFirstWeek(week1)
      setSecondWeek(week2)
      setthirdWeek(week3)
      setFourthWeek(week4)
      setFifthWeek(week5)
      setSixthWeek(week6)
    } else {
      setFirstWeek([])
      setSecondWeek([])
      setthirdWeek([])
      setFourthWeek([])
      setFifthWeek([])
      setSixthWeek([])
      setVendorMonthlyData([])
    }
  }, [weeklyPaymentToVendorLoad, weeklyPaymentToVendorData])

  const [buyerMonthlyData, setBuyerMonthlyData] = useState([])
  useEffect(() => {
    const buyerweek1 = []
    const buyerweek2 = []
    const buyerweek3 = []
    const buyerweek4 = []
    const buyerweek5 = []
    const buyerweek6 = []

    if (
      !weeklyPaymentFromBuyerLoad &&
      weeklyPaymentFromBuyerData &&
      weeklyPaymentFromBuyerData.weeklyPaymentSaleBills &&
      weeklyPaymentFromBuyerData.weeklyPaymentSaleBills.rows &&
      weeklyPaymentFromBuyerData.weeklyPaymentSaleBills.rows.length
    ) {
      const buyermonthFilter = weeklyPaymentFromBuyerData.weeklyPaymentSaleBills.rows.filter(
        (obj) => {
          return moment(Number(obj.due_date)).month() === moment().month()
        },
      )
      // console.log('bbbb==', buyermonthFilter)
      // console.log(moment().month().valueOf())
      setBuyerMonthlyData(buyermonthFilter)
      weeklyPaymentFromBuyerData.weeklyPaymentSaleBills.rows.forEach((el) => {
        const currmonth = moment().month()
        const month = moment(Number(el.due_date)).month()
        const year = moment(Number(el.due_date)).year()
        const curryear = moment().year()
        const week = Math.ceil((moment(Number(el.due_date)).week() % 7) - 1)
        switch (week) {
          case 1:
            if (currmonth === month && year === curryear) {
              buyerweek1.push(el)
            }
            break
          case 2:
            if (currmonth === month && year === curryear) {
              buyerweek2.push(el)
            }
            break
          case 3:
            if (currmonth === month && year === curryear) {
              buyerweek3.push(el)
            }
            break
          case 4:
            if (currmonth === month && year === curryear) {
              buyerweek4.push(el)
            }
            break
          case 5:
            if (currmonth === month && year === curryear) {
              buyerweek5.push(el)
            }
            break
          case 6:
            if (currmonth === month && year === curryear) {
              buyerweek6.push(el)
            }
            break
          default:
            console.log('')
        }
      })
      setBuyerFirstWeek(buyerweek1)
      setBuyerSecondWeek(buyerweek2)
      setBuyerThirdWeek(buyerweek3)
      setBuyerFourthdWeek(buyerweek4)
      setBuyerFifthdWeek(buyerweek5)
      setBuyerSixthWeek(buyerweek6)
    } else {
      setBuyerFirstWeek([])
      setBuyerSecondWeek([])
      setBuyerThirdWeek([])
      setBuyerFourthdWeek([])
      setBuyerFifthdWeek([])
      setBuyerSixthWeek([])
      setBuyerMonthlyData([])
    }
  }, [weeklyPaymentFromBuyerLoad, weeklyPaymentFromBuyerData])

  const vendorcolumns = [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Link to={`/accounts/purchase-bill/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Against P.O',
      dataIndex: 'against_po',
      key: 'against_po',
      render: (text, record) => (
        <Link to={`/purchase-orders/product/update/${record.against_po}`}>{text}</Link>
      ),
    },
    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (text) => (text ? text.toFixed(2) : 0.0),
    },
  ]

  const buyercolumns = [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => <Link to={`sales-bill/update/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Against S.O',
      dataIndex: 'against_so',
      key: 'against_so',
      render: (text, record) => (
        <Link to={`/sales-orders/all/view/${record.against_so}`}>{text}</Link>
      ),
    },
    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (text) => (text ? text.toFixed(2) : 0.0),
    },
  ]

  if (!permissions.includes('readWeeklyPayment')) return <Error403 />
  // if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (companyErr) return `Error occured while fetching data: ${companyErr.message}`
  if (weeklyPaymentToVendorError)
    return `Error occured while fetching data: ${weeklyPaymentToVendorError.message}`
  if (weeklyPaymentFromBuyerError)
    return `Error occured while fetching data: ${weeklyPaymentFromBuyerError.message}`

  return (
    <div>
      <Helmet title="Weekly Payment" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2 text-center">
                  <strong>WEEKLY PAYMENT</strong>
                </h5>
                <div className="row">
                  <div className="col-lg-2 col-4">
                    <Select
                      showSearch
                      // value={}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setView(value)
                      }}
                      // className={companyIDError ? 'custom-error-border' : ''}
                      placeholder="Select an view"
                    >
                      <Select.Option key="1" value="Weekly">
                        Weekly
                      </Select.Option>
                      <Select.Option key="2" value="Monthly">
                        Monthly
                      </Select.Option>
                      <Select.Option key="3" value="Yearly">
                        Yearly
                      </Select.Option>
                    </Select>
                  </div>
                  {view === 'Weekly' && (
                    <div className=" col-lg-3 col-4 custom-pad-r0">
                      {/* <DatePicker
                                                onChange={(value, dateString) => console.log(value, dateString)}
                                                picker="week"
                                            /> */}
                      <RangePicker
                        allowClear={false}
                        id="date"
                        picker="week"
                        style={{ width: '100%' }}
                        format="Do MMM YYYY "
                        placeholder={['Start', 'End']}
                        onChange={(value, dateString) => setDateRange(dateString)}
                      />
                    </div>
                  )}
                  {view === 'Monthly' && (
                    <div className=" col-lg-3 col-4  custom-pad-r0">
                      {/* <DatePicker onChange={(date) => setCurrentMonth(date)} picker="month" /> */}
                      <RangePicker
                        allowClear={false}
                        id="month"
                        picker="month"
                        style={{ width: '100%' }}
                        format="Do MMM YYYY "
                        // placeholder={['Start', 'End']}
                        onChange={(value, dateString) => setDateRange(dateString)}
                      />
                    </div>
                  )}
                  {view === 'Yearly' && (
                    <div className="  col-lg-3 col-4 custom-pad-r0">
                      <DatePicker
                        onChange={(date, dateString) => console.log(date, dateString)}
                        picker="year"
                      />
                      {/* <RangePicker
                                                allowClear={false}
                                                id="year"
                                                picker="year"
                                                style={{ width: '100%' }}
                                                format="Do MMM YYYY "
                                                // placeholder={['Start', 'End']}
                                                onChange={(value, dateString) => setDateRange(dateString)}
                                            /> */}
                    </div>
                  )}
                  <div className="col-lg-7 search-input">
                    <div className="pull-right">
                      <Input
                        prefix={<SearchOutlined />}
                        placeholder="Search"
                        // onChange={({ target: { value } }) => debouncedInputSearch(value)}
                        allowClear
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <h5 className="text-center">All-Payment Report</h5>
                <div className="row">
                  <div className="col-lg-2 col-6">
                    <Select
                      showSearch
                      value={companyID}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setCompanyID(value)
                      }}
                      // className={companyIDError ? 'custom-error-border' : ''}
                      placeholder="Select an brand"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {companyList && companyList.length
                        ? companyList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="kit__utils__table ">
                  {view === 'Weekly' && (
                    <div className="weekly-table">
                      <div className="row">
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 1</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-unpaid">Total Unpaid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {firstWeek
                                  ? firstWeek
                                      .reduce((acc, obj) => acc + obj.total_amount, 0)
                                      .toFixed(2)
                                  : 0}
                              </span>
                            </div>
                            <Table columns={vendorcolumns} dataSource={firstWeek} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 1</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-unpaid">Total Unpaid</div>
                            <div className="amount">
                              &#8377;
                              {(
                                buyerFirstWeek.reduce((acc, obj) => acc + obj.total_amount, 0) -
                                firstWeek.reduce((ac, el) => ac + el.total_amount, 0)
                              ).toFixed(2)}
                            </div>
                            <Table columns={buyercolumns} dataSource={buyerFirstWeek} />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 2</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {secondWeek
                                  ? secondWeek
                                      .reduce((acc, obj) => acc + obj.total_amount, 0)
                                      .toFixed(2)
                                  : 0}
                              </span>
                            </div>
                            <Table columns={vendorcolumns} dataSource={secondWeek} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 2</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {(
                                  buyerSecondWeek.reduce((acc, obj) => acc + obj.total_amount, 0) -
                                  secondWeek.reduce((ac, el) => ac + el.total_amount, 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                            <Table columns={buyercolumns} dataSource={buyerSecondWeek} />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 3</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {thirdWeek
                                  ? thirdWeek
                                      .reduce((acc, obj) => acc + obj.total_amount, 0)
                                      .toFixed(2)
                                  : 0}
                              </span>
                            </div>
                            <Table columns={vendorcolumns} dataSource={thirdWeek} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 3</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {(
                                  buyerThirdWeek.reduce((acc, obj) => acc + obj.total_amount, 0) -
                                  thirdWeek.reduce((ac, el) => ac + el.total_amount, 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                            <Table columns={buyercolumns} dataSource={buyerThirdWeek} />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 4</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {fourthWeek
                                  ? fourthWeek
                                      .reduce((acc, obj) => acc + obj.total_amount, 0)
                                      .toFixed(2)
                                  : 0}
                              </span>
                            </div>
                            <Table columns={vendorcolumns} dataSource={fourthWeek} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 4</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {(
                                  buyerFourthdWeek.reduce((acc, obj) => acc + obj.total_amount, 0) -
                                  fourthWeek.reduce((ac, el) => ac + el.total_amount, 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                            <Table columns={buyercolumns} dataSource={buyerFourthdWeek} />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 5</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {fifthWeek
                                  ? fifthWeek
                                      .reduce((acc, obj) => acc + obj.total_amount, 0)
                                      .toFixed(2)
                                  : 0}
                              </span>
                            </div>
                            <Table columns={vendorcolumns} dataSource={fifthWeek} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 5</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {(
                                  buyerFifthdWeek.reduce((acc, obj) => acc + obj.total_amount, 0) -
                                  fifthWeek.reduce((ac, el) => ac + el.total_amount, 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                            <Table columns={buyercolumns} dataSource={buyerFifthdWeek} />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 6</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;{' '}
                              <span>
                                {sixthWeek
                                  ? sixthWeek
                                      .reduce((acc, obj) => acc + obj.total_amount, 0)
                                      .toFixed(2)
                                  : 0}
                              </span>
                            </div>
                            <Table columns={vendorcolumns} dataSource={sixthWeek} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-6">
                          <div className="week">
                            <strong>WEEK 6</strong>
                          </div>
                          <div className="wrapper mb-4">
                            <div className="total-paid">Total Paid</div>
                            <div className="amount">
                              &#8377;
                              <span>
                                {buyerSixthWeek.reduce((acc, obj) => acc + obj.total_amount, 0) -
                                  sixthWeek.reduce((ac, el) => ac + el.total_amount, 0)}
                              </span>
                            </div>
                            <Table columns={buyercolumns} dataSource={buyerSixthWeek} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {view === 'Monthly' && (
                    <Monthly
                      buyercolumns={buyercolumns}
                      vendorcolumns={vendorcolumns}
                      vendordata={vendorMonthlyData}
                      buyerdata={buyerMonthlyData}
                    />
                  )}
                  {view === 'Yearly' && (
                    <Yearly buyercolumns={buyercolumns} vendorcolumns={vendorcolumns} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(WeeklyPayment))
