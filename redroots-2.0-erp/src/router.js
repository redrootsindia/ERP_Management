import React, { lazy, Suspense } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { connect } from 'react-redux'

import Layout from 'layouts'

const routes = [
  {
    path: '/dashboard',
    Component: lazy(() => import('pages/dashboard')),
    exact: true,
  },
  {
    path: '/costing',
    Component: lazy(() => import('pages/costing')),
    exact: true,
  },
  {
    path: '/costing/:product_id/:version?',
    Component: lazy(() => import('pages/costing/form')),
    exact: true,
  },
  {
    path: '/costing/form/:version/:id?',
    Component: lazy(() => import('pages/costing/form')),
    exact: true,
  },
  // ACCOUNTS
  {
    path: '/accounts/employees',
    Component: lazy(() => import('pages/accounts/employees')),
    exact: true,
  },
  {
    path: '/accounts/employees/:action/:id?',
    Component: lazy(() => import('pages/accounts/employees/form')),
    exact: true,
  },
  {
    path: '/accounts/transport-report',
    Component: lazy(() => import('pages/accounts/transport-report')),
    exact: true,
  },
  {
    path: '/accounts/transport-report/:action/:id?',
    Component: lazy(() => import('pages/accounts/transport-report/form')),
    exact: true,
  },
  {
    path: '/accounts/vendors',
    Component: lazy(() => import('pages/accounts/vendors')),
    exact: true,
  },
  {
    path: '/accounts/vendors/:action/:id?',
    Component: lazy(() => import('pages/accounts/vendors/form')),
    exact: true,
  },
  {
    path: '/accounts/purchase-bill',
    Component: lazy(() => import('pages/accounts/purchase-bill')),
    exact: true,
  },
  {
    path: '/accounts/purchase-bill/:action/:id?',
    Component: lazy(() => import('pages/accounts/purchase-bill/form')),
    exact: true,
  },
  {
    path: '/accounts/buyers',
    Component: lazy(() => import('pages/accounts/buyers')),
    exact: true,
  },
  {
    path: '/accounts/buyers/:action/:id?',
    Component: lazy(() => import('pages/accounts/buyers/form')),
    exact: true,
  },
  {
    path: '/accounting/expense-management',
    Component: lazy(() => import('pages/accounting/expense-management')),
    exact: true,
  },
  {
    path: '/accounting/weekly-payment',
    Component: lazy(() => import('pages/accounting/weekly-payment')),
    exact: true,
  },
  {
    path: '/accounting/financial-dashboard',
    Component: lazy(() => import('pages/accounting/financial-dashboard')),
    exact: true,
  },
  {
    path: '/accounting/expense-summary',
    Component: lazy(() => import('pages/accounting/expense-summary')),
    exact: true,
  },
  {
    path: '/accounting/expense-funds',
    Component: lazy(() => import('pages/accounting/expense-funds')),
    exact: true,
  },

  {
    path: '/accounting/expense-funds/transaction-history',
    Component: lazy(() => import('pages/accounting/expense-funds/transaction-history')),
    exact: true,
  },
  {
    path: '/accounting/expense-management/:action/:id?',
    Component: lazy(() => import('pages/accounting/expense-management/form')),
    exact: true,
  },
  {
    path: '/accounting/debit-notes',
    Component: lazy(() => import('pages/accounting/debit-notes')),
    exact: true,
  },
  {
    path: '/accounting/debit-notes/:action/:id?',
    Component: lazy(() => import('pages/accounting/debit-notes/form')),
    exact: true,
  },

  // PRODUCTION-SUMMARY
  {
    path: '/production-summary',
    Component: lazy(() => import('pages/production-summary')),
    exact: true,
  },

  // TICKETING
  {
    path: '/tickets',
    Component: lazy(() => import('pages/tickets')),
    exact: true,
  },
  {
    path: '/tickets/:action/:id?',
    Component: lazy(() => import('pages/tickets/form')),
    exact: true,
  },
  {
    path: '/ticket-dashboard',
    Component: lazy(() => import('pages/ticketsDashboard')),
    exact: true,
  },

  // MATERIALS
  {
    path: '/materials/all-materials',
    Component: lazy(() => import('pages/materials/all-materials')),
    exact: true,
  },
  {
    path: '/materials/all-materials/:action/:id?',
    Component: lazy(() => import('pages/materials/all-materials/form')),
    exact: true,
  },
  {
    path: '/materials/reports/dashboard',
    Component: lazy(() => import('pages/materials/reports/dashboard')),
    exact: true,
  },
  {
    path: '/materials/reports/ageing',
    Component: lazy(() => import('pages/materials/reports/ageing')),
    exact: true,
  },
  {
    path: '/materials/reports/stock-on-hand',
    Component: lazy(() => import('pages/materials/reports/stock-on-hand/subcategories')),
    exact: true,
  },
  {
    path: '/materials/reports/stock-on-hand/subcategory/:id',
    Component: lazy(() => import('pages/materials/reports/stock-on-hand/subcategory')),
    exact: true,
  },
  {
    path: '/materials/reports/stock-on-hand/material-batches/:id',
    Component: lazy(() => import('pages/materials/reports/stock-on-hand/material-batches')),
    exact: true,
  },
  {
    path: '/materials/reports/stock-on-hand/material-ledger/:id/:batch?/:batchID?',
    Component: lazy(() => import('pages/materials/reports/stock-on-hand/material-ledger')),
    exact: true,
  },
  {
    path: '/materials/material-inwards',
    Component: lazy(() => import('pages/materials/material-inwards')),
    exact: true,
  },
  {
    path: '/materials/material-inwards/:action/:id?',
    Component: lazy(() => import('pages/materials/material-inwards/form')),
    exact: true,
  },
  {
    path: '/materials/reports/write-Off',
    Component: lazy(() => import('pages/materials/reports/write-off')),
    exact: true,
  },

  // PRODUCTS
  {
    path: '/products/all-products',
    Component: lazy(() => import('pages/products/all-products')),
    exact: true,
  },
  {
    path: '/products/all-products/:action/:id?',
    Component: lazy(() => import('pages/products/all-products/form')),
    exact: true,
  },
  {
    path: '/products/margin-calculator',
    Component: lazy(() => import('pages/products/margin-calculator')),
    exact: true,
  },

  // PACKS
  {
    path: '/packs',
    Component: lazy(() => import('pages/packs')),
    exact: true,
  },
  {
    path: '/packs/:action/:id?',
    Component: lazy(() => import('pages/packs/form')),
    exact: true,
  },

  // PURCHASE ORDERS
  {
    path: '/purchase-orders/dashboard',
    Component: lazy(() => import('pages/purchase-orders/summary-dashboard')),
    exact: true,
  },
  {
    path: '/purchase-orders/material',
    Component: lazy(() => import('pages/purchase-orders/material')),
    exact: true,
  },
  {
    path: '/purchase-orders/material/:action/:id?',
    Component: lazy(() => import('pages/purchase-orders/material/form')),
    exact: true,
  },
  {
    path: '/purchase-orders/product',
    Component: lazy(() => import('pages/purchase-orders/product')),
    exact: true,
  },
  {
    path: '/purchase-orders/product/:action/:id?',
    Component: lazy(() => import('pages/purchase-orders/product/form')),
    exact: true,
  },
  {
    path: '/purchase-orders/printer',
    Component: lazy(() => import('pages/purchase-orders/printer')),
    exact: true,
  },
  {
    path: '/purchase-orders/printer/:action/:poID/:type/:id?',
    Component: lazy(() => import('pages/purchase-orders/printer/form')),
    exact: true,
  },

  // SALES ORDERS
  {
    path: '/sales-orders/all',
    Component: lazy(() => import('pages/sales-orders/all-sales-orders')),
    exact: true,
  },
  {
    path: '/sales-orders/all/create',
    Component: lazy(() => import('pages/sales-orders/all-sales-orders/create')),
    exact: true,
  },
  {
    path: '/sales-orders/all/view/:id',
    Component: lazy(() => import('pages/sales-orders/all-sales-orders/view')),
    exact: true,
  },
  {
    path: '/sales-orders/all/generate-picklist/:id',
    Component: lazy(() => import('pages/sales-orders/all-sales-orders/generate-picklist')),
    exact: true,
  },
  {
    path: '/sales-orders/reports/pick-lists-summary',
    Component: lazy(() => import('pages/sales-orders/reports/pick-lists-summary')),
    exact: true,
  },

  {
    path: '/sales-orders/pick-lists',
    Component: lazy(() => import('pages/sales-orders/pick-lists')),
    exact: true,
  },
  {
    path: '/sales-orders/pick-lists/view/:id',
    Component: lazy(() => import('pages/sales-orders/pick-lists/view')),
    exact: true,
  },
  {
    path: '/sales-orders/pick-lists/scan/:id',
    Component: lazy(() => import('pages/sales-orders/pick-lists/scan')),
    exact: true,
  },
  {
    path: '/sales-orders/pick-lists/generate-packaging-list/:id',
    Component: lazy(() => import('pages/sales-orders/pick-lists/generate-packaging-list')),
    exact: true,
  },
  {
    path: '/sales-bill',
    Component: lazy(() => import('pages/sales-orders/sales-bill')),
    exact: true,
  },
  {
    path: '/sales-bill/:action/:id?',
    Component: lazy(() => import('pages/sales-orders/sales-bill/form')),
    exact: true,
  },
  // INVENTORY
  {
    path: '/inventory/overview',
    Component: lazy(() => import('pages/inventory/inventory-overview')),
    exact: true,
  },
  {
    path: '/inventory/ageing-report',
    Component: lazy(() => import('pages/inventory/ageing-report')),
    exact: true,
  },
  {
    path: '/inventory/warehouses',
    Component: lazy(() => import('pages/inventory/warehouses')),
    exact: true,
  },
  {
    path: '/inventory/warehouses/:action/:id?',
    Component: lazy(() => import('pages/inventory/warehouses/form')),
    exact: true,
  },
  {
    path: '/inventory/put-aways',
    Component: lazy(() => import('pages/inventory/put-aways')),
    exact: true,
  },
  {
    path: '/inventory/put-aways/form/:id',
    Component: lazy(() => import('pages/inventory/put-aways/form')),
    exact: true,
  },
  {
    path: '/inventory/stock-transfers',
    Component: lazy(() => import('pages/inventory/stock-transfers')),
    exact: true,
  },
  {
    path: '/inventory/stock-transfers/:action/:id?',
    Component: lazy(() => import('pages/inventory/stock-transfers/outward')),
    exact: true,
  },
  {
    path: '/inventory/rtv',
    Component: lazy(() => import('pages/inventory/rtv')),
    exact: true,
  },
  {
    path: '/inventory/rtv-summary',
    Component: lazy(() => import('pages/inventory/rtv/rtv-summary')),
    exact: true,
  },
  {
    path: '/inventory/rtv/:action/:id?',
    Component: lazy(() => import('pages/inventory/rtv/createRTVForm')),
    exact: true,
  },
  {
    path: '/inventory/rtv/scan-rtv/form/:id?',
    Component: lazy(() => import('pages/inventory/rtv/scanRTVForm')),
    exact: true,
  },

  // PRODUCT-PLAN
  {
    path: '/product-plan',
    Component: lazy(() => import('pages/product-plan')),
    exact: true,
  },
  {
    path: '/product-plan/:action/:id?',
    Component: lazy(() => import('pages/product-plan/form')),
    exact: true,
  },
  {
    path: '/product-plan/style/:id/:brand_id',
    Component: lazy(() => import('pages/product-plan/styles')),
    exact: true,
  },
  {
    path: '/product-plan/create-form/:id/:brand_id',
    Component: lazy(() => import('pages/product-plan/styles/create-form')),
    exact: true,
  },
  {
    path: '/product-plan/product-detail/:plan_id/:product_id',
    Component: lazy(() => import('pages/product-plan/styles/product-detail')),
    exact: true,
  },

  // QC APPOINTMENT
  {
    path: '/qc/appointments',
    Component: lazy(() => import('pages/qc/appointments')),
    exact: true,
  },
  {
    path: '/qc/appointments/:action/:id?',
    Component: lazy(() => import('pages/qc/appointments/form')),
    exact: true,
  },
  {
    path: '/qc/inspections/:id',
    Component: lazy(() => import('pages/qc/inspections/form')),
    exact: true,
  },

  // DELIVERY APPOINTMENT
  {
    path: '/delivery/appointments',
    Component: lazy(() => import('pages/delivery/appointments')),
    exact: true,
  },
  {
    path: '/delivery/appointments/from-qc/:action/:qcID/:id?',
    Component: lazy(() => import('pages/delivery/appointments/form')),
    exact: true,
  },
  {
    path: '/delivery/appointments/skip-qc/:action/:id?/:qcID?',
    Component: lazy(() => import('pages/delivery/appointments/form')),
    exact: true,
  },

  // SETTINGS
  {
    path: '/settings/roles',
    Component: lazy(() => import('pages/settings/roles')),
    exact: true,
  },

  {
    path: '/settings/misc/uom',
    Component: lazy(() => import('pages/settings/misc/uom')),
    exact: true,
  },
  {
    path: '/settings/misc/hsn',
    Component: lazy(() => import('pages/settings/misc/hsn')),
    exact: true,
  },
  {
    path: '/settings/misc/organizations',
    Component: lazy(() => import('pages/settings/misc/organizations')),
    exact: true,
  },
  {
    path: '/settings/misc/organizations/:action/:id?',
    Component: lazy(() => import('pages/settings/misc/organizations/form')),
    exact: true,
  },
  {
    path: '/settings/misc/brands',
    Component: lazy(() => import('pages/settings/misc/brands')),
    exact: true,
  },

  {
    path: '/settings/buyer-settings/buyer-groups',
    Component: lazy(() => import('pages/settings/buyer-settings/buyer-groups')),
    exact: true,
  },
  {
    path: '/settings/buyer-settings/buyer-warehouses',
    Component: lazy(() => import('pages/settings/buyer-settings/buyer-warehouses')),
    exact: true,
  },

  {
    path: '/settings/vendor-settings/payment-terms',
    Component: lazy(() => import('pages/settings/vendor-settings/payment-terms')),
    exact: true,
  },
  {
    path: '/settings/vendor-settings/lead-time',
    Component: lazy(() => import('pages/settings/vendor-settings/lead-time')),
    exact: true,
  },
  {
    path: '/settings/vendor-settings/vendor-types',
    Component: lazy(() => import('pages/settings/vendor-settings/vendor-types')),
    exact: true,
  },

  {
    path: '/settings/material-settings/categories',
    Component: lazy(() => import('pages/settings/material-settings/categories')),
    exact: true,
  },
  {
    path: '/settings/material-settings/subcategories',
    Component: lazy(() => import('pages/settings/material-settings/subcategories')),
    exact: true,
  },
  {
    path: '/settings/material-settings/colors',
    Component: lazy(() => import('pages/settings/material-settings/colors')),
    exact: true,
  },

  {
    path: '/settings/product-settings/subcategories',
    Component: lazy(() => import('pages/settings/product-settings/subcategories')),
    exact: true,
  },
  {
    path: '/settings/product-settings/categories',
    Component: lazy(() => import('pages/settings/product-settings/categories')),
    exact: true,
  },

  {
    path: '/settings/product-settings/attributes',
    Component: lazy(() => import('pages/settings/product-settings/attributes')),
    exact: true,
  },

  {
    path: '/settings/product-settings/attribute-values',
    Component: lazy(() => import('pages/settings/product-settings/attribute-values')),
    exact: true,
  },

  {
    path: '/settings/inventory-settings/return-reason-categories',
    Component: lazy(() => import('pages/settings/inventory-settings/return-reason-categories')),
    exact: true,
  },
  {
    path: '/settings/inventory-settings/return-reasons',
    Component: lazy(() => import('pages/settings/inventory-settings/return-reasons')),
    exact: true,
  },
  {
    path: '/settings/inventory-settings/unsalable-reason',
    Component: lazy(() => import('pages/settings/inventory-settings/unsalable-reason')),
    exact: true,
  },
  {
    path: '/settings/qc-settings/aql-levels',
    Component: lazy(() => import('pages/settings/qc-settings/aql-levels')),
    exact: true,
  },
  {
    path: '/settings/qc-settings/aql-levels/:action/:id?',
    Component: lazy(() => import('pages/settings/qc-settings/aql-levels/form')),
    exact: true,
  },
  {
    path: '/settings/qc-settings/general-defects',
    Component: lazy(() => import('pages/settings/qc-settings/general-defects')),
    exact: true,
  },
  {
    path: '/settings/qc-settings/product-specifications',
    Component: lazy(() => import('pages/settings/qc-settings/product-specifications')),
    exact: true,
  },

  {
    path: '/settings/expense-settings/categories',
    Component: lazy(() => import('pages/settings/expense-settings/categories')),
    exact: true,
  },
  {
    path: '/settings/expense-settings/subcategories',
    Component: lazy(() => import('pages/settings/expense-settings/subcategories')),
    exact: true,
  },

  // AUTH-ROUTES
  {
    path: '/auth/login',
    Component: lazy(() => import('pages/auth/login')),
    exact: true,
  },
  {
    path: '/auth/forgot-password',
    Component: lazy(() => import('pages/auth/forgot-password')),
    exact: true,
  },
  {
    path: '/auth/register',
    Component: lazy(() => import('pages/auth/register')),
    exact: true,
  },
  {
    path: '/auth/lockscreen',
    Component: lazy(() => import('pages/auth/lockscreen')),
    exact: true,
  },
  {
    path: '/auth/404',
    Component: lazy(() => import('pages/auth/404')),
    exact: true,
  },
  {
    path: '/auth/500',
    Component: lazy(() => import('pages/auth/500')),
    exact: true,
  },
  // proforma invoice route
  {
    path: '/proforma-invoice',
    Component: lazy(() => import('pages/proforma-invoice')),
    exact: true,
  },
  {
    path: '/proforma-invoice/:action/:id?',
    Component: lazy(() => import('pages/proforma-invoice/form')),
    exact: true,
  },
  {
    path: '/pi-summary',
    Component: lazy(() => import('pages/proforma-invoice/pi-summary/index')),
    exact: true,
  },
  {
    path: '/grn/putaways-grn',
    Component: lazy(() => import('pages/grn/putaways-grn')),
    exact: true,
  },
  {
    path: '/grn/material-inward-grn',
    Component: lazy(() => import('pages/grn/material-inward-grn')),
    exact: true,
  },
  // brand paymeny
  {
    path: '/brand-payment',
    Component: lazy(() => import('pages/brand-payment')),
    exact: true,
  },
  {
    path: '/brand-payment/invoice-details/view/:id',
    Component: lazy(() => import('pages/brand-payment/invoice-details')),
    exact: true,
  },
  {
    path: '/brand-payment/transporter/:id',
    Component: lazy(() => import('pages/brand-payment/transporter')),
    exact: true,
  },
  {
    path: '/brand-payment/vendor-details',
    Component: lazy(() => import('pages/brand-payment/vendor-details')),
    exact: true,
  },
  {
    path: '/sample-product',
    Component: lazy(() => import('pages/sample-product')),
    exact: true,
  },
  {
    path: '/sample-product/:action/:id?',
    Component: lazy(() => import('pages/sample-product/form')),
    exact: true,
  },
  {
    path: '/sales-order-status',
    Component: lazy(() => import('pages/sales-orders/sales-order-status')),
    exact: true,
  },
  // vendor appointment
  {
    path: '/vendor-appointmnet',
    Component: lazy(() => import('pages/vendor-appointment')),
    exact: true,
  },
  {
    path: '/vendor-appointmnet/:action/:id?',
    Component: lazy(() => import('pages/vendor-appointment/form')),
    exact: true,
  },
]

const mapStateToProps = ({ settings }) => ({
  routerAnimation: settings.routerAnimation,
})

const Router = ({ history, routerAnimation }) => {
  return (
    <ConnectedRouter history={history}>
      <Layout>
        <Route
          render={(state) => {
            const { location } = state
            return (
              <SwitchTransition>
                <CSSTransition
                  key={location.pathname}
                  appear
                  classNames={routerAnimation}
                  timeout={routerAnimation === 'none' ? 0 : 300}
                >
                  <Switch location={location}>
                    {/* VB:REPLACE-NEXT-LINE:ROUTER-REDIRECT */}
                    <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
                    {routes.map(({ path, Component, exact }) => (
                      <Route
                        path={path}
                        key={path}
                        exact={exact}
                        render={() => {
                          return (
                            <div className={routerAnimation}>
                              <Suspense fallback={null}>
                                <Component />
                              </Suspense>
                            </div>
                          )
                        }}
                      />
                    ))}
                    <Redirect to="/auth/404" />
                  </Switch>
                </CSSTransition>
              </SwitchTransition>
            )
          }}
        />
      </Layout>
    </ConnectedRouter>
  )
}

export default connect(mapStateToProps)(Router)
