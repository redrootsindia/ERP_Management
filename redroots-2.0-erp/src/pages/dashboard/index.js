import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import ProductPurchaseOrderStatus from './productPurchaseOrderStatus'
import IncompleteVendors from './incompleteVendorsModal'
import IncompleteProducts from './incompleteProductsModal'
import IncompleteMaterials from './incompleteMaterial'
import IncompleteProofOfDeliveries from './incompleteProofOfDeliveries'
import Calendar from './calendar'
import SummaryDashboard from '../purchase-orders/summary-dashboard'

const mapStateToProps = ({ user }) => ({ user })

const Dashboard = ({ user: { permissions, type } }) => {
  return (
    <div>
      <Helmet title="Dashboard" />
      {permissions.includes('readDashboard') && type !== 'vendor' && (
        <div>
          <div className="row">
            <IncompleteVendors />
            <IncompleteProducts />
            <IncompleteMaterials />
          </div>
          <div className="row">
            <ProductPurchaseOrderStatus status="In Progress" />
            <ProductPurchaseOrderStatus status="Assigned" />
            <ProductPurchaseOrderStatus status="Draft" />
          </div>
          <div className="row">
            <IncompleteProofOfDeliveries />
          </div>
          <div className="row">
            <div className="col-lg-12">
              <SummaryDashboard dashboardProp="dashboard" />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <Calendar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(Dashboard))
