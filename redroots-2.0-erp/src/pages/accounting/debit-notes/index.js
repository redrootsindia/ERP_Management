import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Button, Input, Spin, Table } from 'antd'
import { useQuery } from '@apollo/client'
import Error403 from 'components/Errors/403'
import { debounce } from 'lodash'
import moment from 'moment'
import { SearchOutlined } from '@ant-design/icons'
import { DEBIT_NOTES } from './query'

const mapStateToProps = ({ user }) => ({ user })

const DebitNotes = ({ user: { permissions } }) => {
  const [debitNoteList, setDebtNoteList] = useState([])
  const [debitSearchString, setDebitSearchString] = useState('')
  const {
    loading: debitNoteLoad,
    data: debitNoteData,
    error: debitNoteError,
  } = useQuery(DEBIT_NOTES, { variables: { searchString: debitSearchString } })
  const debouncedInputSearch = debounce((value) => {
    setDebitSearchString(value)
    // setCurrentPage(1)
  }, 500)
  useEffect(() => {
    if (
      !debitNoteLoad &&
      debitNoteData &&
      debitNoteData.debitNotes &&
      debitNoteData.debitNotes.rows &&
      debitNoteData.debitNotes.rows.length
    ) {
      setDebtNoteList(debitNoteData.debitNotes.rows)
    } else {
      setDebtNoteList([])
    }
  }, [debitNoteLoad, debitNoteData])
  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Link to={`/accounting/debit-notes/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'P.O NO',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
    },
    {
      title: 'Material',
      dataIndex: 'material_name',
      key: 'material_name',
      // render: (text, record) => (
      //   <span>{}</span>
      // ),
    },
    {
      title: 'Debit Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },

    {
      title: 'Batch Code',
      dataIndex: 'batch_code',
      key: 'batch_code',
    },
    {
      title: 'Labour Cost',
      dataIndex: 'labour_cast',
      key: 'labour_cast',
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
    },
  ]

  if (!permissions.includes('readDebitNotes')) return <Error403 />
  if (debitNoteError) return `Error occured while fetching data: ${debitNoteError.message}`

  return (
    <div>
      <Helmet title="Debit Note" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Debit Notes</strong>
                </h5>
                <div className="row">
                  {permissions.includes('createDebitNotes') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/accounting/debit-notes/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-2">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search"
                      onChange={({ target: { value } }) => debouncedInputSearch(value)}
                      allowClear
                    />
                  </div>
                </div>
              </div>

              <div className="card-body">
                <Table columns={tableColumns} dataSource={debitNoteList} />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(DebitNotes))
