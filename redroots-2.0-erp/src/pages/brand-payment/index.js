import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Spin, Select, Table, DatePicker, Image } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import { useQuery } from '@apollo/client'
import { EyeOutlined } from '@ant-design/icons'
import { ORGANIZATIONS } from 'pages/purchase-orders/material/queries'
import { BRANDS, BUYER_NAME_LIST, BRAND_PAYMENTS } from './query'

// const Option = Select
const mapStateToProps = ({ user }) => ({ user })

const BrandPayment = ({ user: { permissions } }) => {
  const [brandID, setBrandID] = useState(undefined)
  const [brandList, setBrandList] = useState([])
  const [buyerIDs, setBuyerIDS] = useState([])
  const [buyerList, setBuyerList] = useState([])
  const [salesType, setSalesType] = useState(undefined)
  const [brandPaymentLists, setBrandPaymentLists] = useState([])
  const [company, setCompany] = useState(undefined)
  const [companyNames, setCompanyNames] = useState([])

  const { loading: companyLoad, data: companyData, error: companyError } = useQuery(ORGANIZATIONS)
  useEffect(() => {
    if (
      !companyLoad &&
      companyData &&
      companyData.organizations &&
      companyData.organizations.length
    ) {
      setCompanyNames(companyData.organizations)
    }
  }, [companyLoad, companyData])
  const {
    loading: brandPaymentLoad,
    data: brandPaymentData,
    error: brandPaymentError,
  } = useQuery(BRAND_PAYMENTS, {
    variables: {
      brandIDs: brandID,
      buyerIDs,
      companyIDs: company,
      // vendorIDs,
      // statusFilter,
      // searchString,
      // sortBy,
      // limit,
      // offset
    },
  })
  useEffect(() => {
    if (
      !brandPaymentLoad &&
      brandPaymentData &&
      brandPaymentData.brandPaymentSBs &&
      brandPaymentData.brandPaymentSBs.rows &&
      brandPaymentData.brandPaymentSBs.rows.length
    ) {
      setBrandPaymentLists(brandPaymentData.brandPaymentSBs.rows)
    }
  }, [brandPaymentLoad, brandPaymentData])
  const { data: brandNames, loading: brandLoading, erroor: brandErr } = useQuery(BRANDS)
  useEffect(() => {
    if (!brandLoading && brandNames && brandNames.brands && brandNames.brands.length) {
      setBrandList(brandNames.brands)
    }
  }, [brandNames, brandLoading])

  const { loading: buyerLoad, error: buyerErr, data: buyerData } = useQuery(BUYER_NAME_LIST)
  useEffect(() => {
    if (!buyerLoad && buyerData && buyerData.buyerNames && buyerData.buyerNames.length) {
      setBuyerList(buyerData.buyerNames)
    } else {
      setBuyerList([])
    }
  }, [buyerData, buyerLoad])

  const tableColumns = [
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      render: (text) => {
        return {
          props: {
            style: { background: '#76D7C4' },
          },
          children: (
            <Link to="/brand-payment/vendor-details">
              <span>{text}</span>
            </Link>
          ),
        }
      },
    },

    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
    },
    {
      title: ' Invoice Date',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      render: (text) => moment(Number(text)).format('MMM Do YYYY'),
    },
    {
      title: 'Sales Type',
      dataIndex: 'sales_type',
      key: 'sales_type',
    },
    {
      title: 'PI NO',
      dataIndex: 'pi_no',
      key: 'pi_no',
    },
    {
      title: 'Buyer PO',
      dataIndex: 'buyer_po',
      key: 'buyer_po',
    },

    {
      title: 'Invoice No.',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text, record) => {
        return {
          props: {
            style: { background: '#f9e4e4' },
          },
          children: (
            <Link to={`/vendor-appointmnet/update/${Number(record.invoice_number)}`}>
              <span>{text}</span>
            </Link>
          ),
        }
      },
    },
    {
      title: 'LR NO',
      dataIndex: 'lr_number',
      key: 'lr_number',
      render: (text, record) => {
        return {
          props: {
            style: { background: '#c2bcbc' },
          },
          children: (
            <Link to={`/accounts/transport-report/update/${record.lr_number}`}>
              {/* <Link to={`/vendor-appointmnet/update/${record.lr_number}`}> */}
              <span>{text}</span>
            </Link>
          ),
        }
      },
    },
    {
      title: 'SO NO',
      dataIndex: 'so_number',
      key: 'so_number',
      render: (text, record) => {
        return {
          props: {
            style: { background: '#a291e1' },
          },
          children: (
            <Link to={`/sales-orders/all/view/${record.so_number}`}>
              <span>{text}</span>
            </Link>
          ),
        }
      },
    },
    {
      title: 'INVOICE QTY',
      dataIndex: 'invoice_quantity',
      key: 'invoice_quantity',
    },
    {
      title: 'NO OF BOXEX',
      dataIndex: 'no_of_boxex',
      key: 'no_of_boxex',
    },
    {
      title: 'BASE VALUE',
      dataIndex: 'base_value',
      key: 'base_value',
    },
    {
      title: 'TAX VALUE',
      dataIndex: 'tax_value',
      key: 'tax_value',
    },
    {
      title: 'GST %',
      dataIndex: 'gst',
      key: 'gst',
    },
    {
      title: 'TOTAL VALUE',
      dataIndex: 'total_value',
      key: 'total_value',
      width: '8.33%',
    },
    {
      title: 'E WAY BILL',
      dataIndex: 'e_way_bill',
      key: 'e_way_bill',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
            height={image ? 50 : 20}
            width={image ? 50 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
      // render: (text, record) => (
      //   <a
      //     href={
      //       `${!record.src}`
      //         ? 'https://www.africau.edu/images/default/sample.pdf'
      //         : `/resources/images/${record.src}`
      //     }
      //     rel="noreferrer"
      //     target="_blank"
      //   >
      //     {record.src}
      //   </a>
      // ),
    },

    {
      title: 'GRN NO',
      dataIndex: 'grn_no',
      key: 'grn_no',
      render: (text, record) => {
        return {
          props: {
            style: { background: '#F7DC6F' },
          },
          children: <Link to={`/inventory/put-aways/form/${record.grn_no}`}>{text}</Link>,
        }
      },
    },
  ]

  if (!permissions.includes('readBrandPayment')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (buyerErr) return `Error occured while fetching data: ${buyerErr.message}`
  if (brandPaymentError) return `Error occured while fetching data: ${brandPaymentError.message}`
  if (companyError) return `Error occured while fetching data: ${companyError.message}`
  return (
    <div>
      <Helmet title="Brand Payment" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>BRAND PAYMENT</strong>
                </h5>
                <div className="row">
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      // mode="multiple"
                      showSearch
                      value={brandID}
                      onChange={(value) => setBrandID(value)}
                      placeholder="Brand"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {brandList && brandList.length
                        ? brandList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <DatePicker onChange={(value) => console.log(value.valueOf())} />
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <DatePicker
                      onChange={(value) => console.log(value.format('MMM'))}
                      picker="month"
                    />
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      // mode="multiple"
                      showSearch
                      value={buyerIDs}
                      onChange={(value) => setBuyerIDS(value)}
                      placeholder="Buyers"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {buyerList && buyerList.length
                        ? buyerList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>

                  <div className="col-lg-2">
                    <Select
                      key="company"
                      value={company || null}
                      placeholder="Select Company"
                      showSearch
                      onChange={(value) => setCompany(value)}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 w-100"
                    >
                      {companyNames && companyNames.length
                        ? companyNames.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>

                  <div className="col-lg-2">
                    <Select
                      key="Sales_type"
                      value={salesType}
                      placeholder="Sales type"
                      showSearch
                      onChange={(value) => setSalesType(value)}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 w-100"
                    >
                      <Select.Option key={0} value="Market placa">
                        Market Place
                      </Select.Option>
                      <Select.Option key={1} value="Retail">
                        Retail
                      </Select.Option>
                      <Select.Option key={3} value="OutRight">
                        OutRight
                      </Select.Option>
                      <Select.Option key={3} value="SOR">
                        SOR
                      </Select.Option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <Table
                  columns={tableColumns}
                  dataSource={brandPaymentLists}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                  scroll={{ x: 2500, y: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(BrandPayment))
