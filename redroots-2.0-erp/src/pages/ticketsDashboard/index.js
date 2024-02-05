import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import TicketStatus from './ticketStatus'

const mapStateToProps = ({ user }) => ({ user })

const TicketsDashboard = ({ user: { permissions } }) => {
  return (
    <div>
      <Helmet title="Dashboard" />
      {permissions.includes('readTicketDashboard') && (
        <>
          <div className="row">
            {/* <TicketStatus status="Draft" /> */}
            <TicketStatus status="In Progress" />
            {/* <TicketStatus status="Completed" /> */}
            <TicketStatus status="Cancelled" />
            <TicketStatus raised_by="Vendor" />
          </div>
          <div className="row">
            {/* <TicketStatus un_assigned /> */}
            {/* <TicketStatus type="Purchase Order" /> */}
          </div>
        </>
      )}
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(TicketsDashboard))
