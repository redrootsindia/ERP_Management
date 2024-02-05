import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import MaterialsCount from './materialsCount'

const mapStateToProps = ({ user }) => ({ user })

const MaterialDashboard = ({ user: { permissions } }) => {
  return (
    <div>
      <Helmet title="Material Dashboard" />
      {permissions.includes('readMaterialDashboard') && (
        <>
          <div className="row">
            <MaterialsCount status="In Progress" />
            <MaterialsCount active="inactive" />
            <MaterialsCount />
          </div>
        </>
      )}
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(MaterialDashboard))
