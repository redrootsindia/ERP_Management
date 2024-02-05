import React from 'react'
import { Helmet } from 'react-helmet'
import { Tabs } from 'antd'
import PutAwayTab from './putAwayTab'
import './style.scss'

const { TabPane } = Tabs

const PutAways = () => {
  return (
    <div>
      <Helmet title="Put Aways" />
      <div className="row mt-4">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-2">
                <strong>PUT AWAYS</strong>
              </h5>
              {/* {permissions.includes('createPutAway') ? (
                  <Link to="/inventory/put-aways/form/1">
                    <Button type="primary">Create</Button>
                  </Link>
                ) : null} */}
            </div>

            <div className="card-body putAwayTabs">
              <Tabs defaultActiveKey="1">
                <TabPane tab="Pending Put-Aways" key="1">
                  <PutAwayTab statusType="pending" />
                </TabPane>
                <TabPane tab="Completed Put-Aways" key="2">
                  <PutAwayTab statusType="completed" search="true" />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PutAways
