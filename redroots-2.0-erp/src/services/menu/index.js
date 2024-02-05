export default async function getMenuData() {
  return [
    {
      title: 'Dashboard',
      key: '__dashboard',
      url: '/dashboard',
      icon: 'fa fa-home',
    },
    {
      title: 'Costing',
      key: '__costing',
      url: '/costing',
      icon: 'fa fa-inr',
    },
    {
      title: 'Proforma-Invoice',
      key: '__proforma-invoice',
      icon: 'fa fa-file-powerpoint-o',
      url: '/proforma-invoice',
    },

    {
      title: 'GRN',
      key: '__grn',
      icon: 'fa fa-check-square-o',
      children: [
        {
          title: 'PutAways Grn',
          key: '__putaways_grn',
          url: '/grn/putaways-grn',
          // permissionsArray: ['readPutawaysGRN'],
        },
        {
          title: 'Material-inward Grn',
          key: '__putaways_grn',
          url: '/grn/material-inward-grn',
          // permissionsArray: ['readMaterialInwardGRN'],
        },
      ],
    },
    // {
    //   category: true,
    //   title: 'Production',
    //   key: '__main_category_production',
    //   permissionsArray: ['readPurchaseOrder', 'readSalesOrderReport'],
    // },
    {
      title: 'Reports',
      key: '__report',
      icon: 'fa fa-check-square-o',
      children: [
        {
          title: 'Production Summary (M.O.S)',
          key: '__production_summary',
          url: '/production-summary',
          permissionsArray: ['readProductionSummary'],
        },
        {
          title: 'Brand Payment',
          key: '__brand_payment',
          url: '/brand-payment',
        },
        {
          title: 'Margin Calculator',
          key: '__margin_calculator',
          url: '/products/margin-calculator',
          permissionsArray: ['readMarginCalculator'],
        },
        {
          title: 'PI Summary',
          key: '__pi_summary',
          url: '/pi-summary',
          icon: 'fa fa-check-square-o',
          permissionsArray: ['readPiSummary'],
        },
      ],
    },
    {
      title: 'Orders',
      key: '__order',
      icon: 'fa fa-shopping-bag',
      children: [
        {
          title: 'Purchase Orders',
          key: '__purchase_orders',
          permissionsArray: ['readPurchaseOrder'],
          children: [
            {
              title: 'Summary Dashboard',
              key: '__summary_dashboard_purchase_orders',
              url: '/purchase-orders/dashboard',
              permissionsArray: ['readSummaryDashboard'],
            },
            {
              title: 'Material PO',
              key: '__material_purchase_orders',
              url: '/purchase-orders/material',
              permissionsArray: ['readPurchaseOrder'],
            },
            {
              title: 'Product PO',
              key: '__product_purchase_orders',
              url: '/purchase-orders/product',
              permissionsArray: ['readPurchaseOrder'],
            },
            {
              title: 'Sample Product',
              key: '__product_sample',
              url: '/sample-product',
              permissionsArray: ['readSampleProduct'],
            },
            {
              title: 'Printer PO',
              key: '__printer_purchase_orders',
              url: '/purchase-orders/printer',
              permissionsArray: ['readPurchaseOrder'],
            },
          ],
        },
        {
          title: 'Sales Orders',
          key: '__sales_orders',
          icon: 'fa fa-inr',
          permissionsArray: [
            'readSalesOrder',
            'readPickList',
            'readSalesOrderReport',
            'readSalesBill',
          ],
          children: [
            {
              title: 'All Sales Orders',
              key: '__sales_orders_all',
              url: '/sales-orders/all',
              permissionsArray: ['readSalesOrder'],
            },
            {
              title: 'Sales Bill',
              key: '__sales_bill',
              url: '/sales-bill',
              permissionsArray: ['readSalesBill'],
            },
            {
              title: 'Pick Lists',
              key: '__sales_orders_pick_lists',
              url: '/sales-orders/pick-lists',
              permissionsArray: ['readPickList'],
            },
            {
              title: 'SO Status',
              key: '__so_status',
              url: '/sales-order-status',
              permissionsArray: ['readSalesOrderStatus'],
            },
            {
              title: 'Reports',
              key: '__sales_orders_reports',
              permissionsArray: ['readSalesOrderReport'],
              children: [
                {
                  title: 'Pick Lists Summary',
                  key: '__sales_orders_reports_pick_list_summary',
                  url: '/sales-orders/reports/pick-lists-summary',
                  permissionsArray: ['readSalesOrderReport'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Vendor Appointment',
      key: '__vendor_appointment',
      url: '/vendor-appointmnet',
      icon: 'fa fa-industry',
      permissionsArray: ['readVendorAppointment'],
    },
    {
      title: 'Appointments',
      key: '__appointments',
      icon: 'fa fa-check-square-o',
      children: [
        {
          title: 'QC Appointments',
          key: '__qc_appointments',
          url: '/qc/appointments',
          icon: 'fa fa-check-square-o',
          permissionsArray: ['readQCAppointment'],
        },
        {
          title: 'Delivery Appointments',
          key: '__delivery_appointments',
          url: '/delivery/appointments',
          icon: 'fa fa-truck',
          permissionsArray: ['readDeliveryAppointment'],
        },
      ],
    },

    {
      title: 'Inventory',
      key: '__inventory',
      icon: 'fa fa-bank',
      // prettier-ignore
      permissionsArray: ['readWarehouse', 'readInventoryOverview', 'readAgeingReport', 'readPutAway', 'readStockTransfer',
        'readInternalAdjustment', 'readWriteOff'],
      children: [
        {
          title: 'Inventory Overview',
          key: '__inventory_overview',
          url: '/inventory/overview',
          permissionsArray: ['readInventoryOverview'],
        },
        {
          title: 'Ageing Report',
          key: '__ageing_report',
          url: '/inventory/ageing-report',
          permissionsArray: ['readAgeingReport'],
        },
        {
          title: 'Warehouses',
          key: '__inventory_warehouses',
          url: '/inventory/warehouses',
          permissionsArray: ['readWarehouse'],
        },
        {
          title: 'Put-Aways',
          key: '__inventory_putAways',
          url: '/inventory/put-aways',
          permissionsArray: ['readPutAway'],
        },
        {
          title: 'Stock-Transfers',
          key: '__inventory_stockTransfers',
          url: '/inventory/stock-transfers',
          permissionsArray: ['readStockTransfer'],
        },
        {
          title: 'Internal-Adjustments',
          key: '__inventory_internalAdjustments',
          // url: '/inventory/stock-transfers',
          permissionsArray: ['readInternalAdjustment'],
        },
        {
          title: 'Write-Offs',
          key: '__inventory_writeOffs',
          // url: '/inventory/stock-transfers',
          permissionsArray: ['readWriteOff'],
        },
        {
          title: 'RTVs',
          key: '__inventory_rtvs',
          url: '/inventory/rtv',
          permissionsArray: ['readRTV'],
        },
        {
          title: 'RTVs Summary',
          key: '__inventory_rtvs',
          url: '/inventory/rtv-summary',
          permissionsArray: ['readRTVSummary'],
        },
      ],
    },

    {
      title: 'Product Plan',
      key: '__product_plan',
      url: '/product-plan',
      permissionsArray: ['readProductPlan'],
    },

    {
      category: true,
      title: 'Master',
      key: '__main_category_stock',
      // prettier-ignore
      permissionsArray: ['readProduct', 'readMarginCalculator', 'readPack', 'readMaterial',
        'readMaterialInward', 'readMaterialReport'],
    },
    {
      title: 'Products',
      key: '__products',
      icon: 'fa fa-shopping-bag',
      permissionsArray: ['readProduct', 'readMarginCalculator'],
      children: [
        {
          title: 'All Products',
          key: '__products_all',
          url: '/products/all-products',
          permissionsArray: ['readProduct'],
        },
        {
          title: 'Packs',
          key: '__packs',
          icon: 'fa fa-briefcase',
          url: '/packs/',
          permissionsArray: ['readPack'],
        },
      ],
    },

    {
      title: 'Materials',
      key: '__materials',
      icon: 'fa fa-cubes',
      permissionsArray: ['readMaterial', 'readMaterialInward', 'readMaterialReport'],
      children: [
        {
          title: 'All Materials',
          key: '__materials_all',
          url: '/materials/all-materials',
          permissionsArray: ['readMaterial'],
        },
        {
          title: 'Material Inwards',
          key: '__materials_inward',
          url: '/materials/material-inwards',
          permissionsArray: ['readMaterialInward'],
        },
        {
          title: 'Reports',
          key: '__materials_reports',
          permissionsArray: ['readMaterialReport'],
          children: [
            {
              title: 'Dashboard',
              key: '__materials_reports_dashboard',
              url: '/materials/reports/dashboard',
              permissionsArray: ['readMaterialDashboard'],
            },
            {
              title: 'Ageing',
              key: '__materials_reports_ageing',
              url: '/materials/reports/ageing',
              permissionsArray: ['readMaterialReport'],
            },
            {
              title: 'SOH Report',
              key: '__materials_reports_soh',
              url: '/materials/reports/stock-on-hand',
              permissionsArray: ['readMaterialReport'],
            },
            {
              title: 'Write-Off Report',
              key: '__materials_reports_writeOff',
              url: '/materials/reports/write-off',
              permissionsArray: ['readMaterialReport'],
            },
          ],
        },
      ],
    },

    {
      title: 'Accounting',
      key: '__accounting',
      icon: 'fa fa-credit-card',
      children: [
        {
          title: 'Expense Management',
          key: '__expense_management',
          url: '/accounting/expense-management',
          icon: 'fa fa-credit-card',
          permissionsArray: ['readExpenseManagement'],
        },
        {
          title: 'Expense Summary',
          key: '__expense_summary',
          url: '/accounting/expense-summary',
          permissionsArray: ['readExpenseSummary'],
        },
        {
          title: 'Financial Dashboard',
          key: '__financial_dashboard',
          url: '/accounting/financial-dashboard',
          permissionsArray: ['readFinancialDashboard'],
        },
        {
          title: 'Weekly Payment',
          key: '__weekly_payment',
          url: '/accounting/weekly-payment',
          permissionsArray: ['readWeeklyPayment'],
        },
        {
          title: 'Debit Notes',
          key: '__debit_notes',
          url: '/accounting/debit-notes',
          permissionsArray: ['readDebitNotes'],
        },
        {
          title: 'Account Funds',
          key: '__account_funds',
          url: '/accounting/expense-funds',
          permissionsArray: ['readAccountFunds'],
        },
      ],
    },

    // {
    //   category: true,
    //   title: 'Ticketing',
    //   key: '__main_category_ticketing',
    //   permissionsArray: ['readTicket', 'readTicketDashboard'],
    // },
    {
      title: 'Tickets',
      key: '__tickets',
      icon: 'fa fa-ticket',
      children: [
        {
          title: 'Ticket Dashboard',
          key: '__ticket_dashboard',
          url: '/ticket-dashboard',
          icon: 'fa fa-tasks',
          permissionsArray: ['readTicketDashboard'],
        },
        {
          title: 'Tickets',
          key: '__tickets',
          url: '/tickets',
          icon: 'fa fa-ticket',
          permissionsArray: ['readTicket'],
        },
      ],
    },

    {
      category: true,
      title: 'Configurations',
      key: '__main_category_configurations',
      permissionsArray: ['readEmployee', 'readVendor', 'readBuyer', 'readRole', 'readSettings'],
    },
    {
      title: 'Accounts',
      key: '__accounts',
      icon: 'fa fa-user',
      permissionsArray: ['readEmployee', 'readVendor', 'readBuyer', 'readPurchaseBill'],
      children: [
        {
          title: 'Employees',
          key: '__accounts_employees',
          url: '/accounts/employees',
          permissionsArray: ['readEmployee'],
        },
        {
          title: 'Transport Report',
          key: '__accounts_transport_report',
          url: '/accounts/transport-report',
          permissionsArray: ['readTransportReport'],
        },
        {
          title: 'Purchase Bill',
          key: '__accounts_purchase_bill',
          url: '/accounts/purchase-bill',
          permissionsArray: ['readPurchaseBill'],
        },
        {
          title: 'Vendors',
          key: '__accounts_vendors',
          url: '/accounts/vendors',
          permissionsArray: ['readVendor'],
        },

        {
          title: 'Buyers',
          key: '__accounts_buyers',
          url: '/accounts/buyers',
          permissionsArray: ['readBuyer'],
        },
        {
          title: 'Settings',
          key: '__settings',
          icon: 'fa fa-gear',
          permissionsArray: ['readRole', 'readSettings'],
          children: [
            {
              title: 'Roles',
              key: '__settings_roles',
              url: '/settings/roles',
              permissionsArray: ['readRole'],
            },
            {
              title: 'Vendor Settings',
              key: '__settings_vendors',
              permissionsArray: ['readSettings'],
              children: [
                {
                  title: 'Vendor Types',
                  key: '__settings_vendors_vendor_types',
                  url: '/settings/vendor-settings/vendor-types',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Payment Terms',
                  key: '__settings_vendors_payment_terms',
                  url: '/settings/vendor-settings/payment-terms',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Lead Time',
                  key: '__settings_vendors_lead_time',
                  url: '/settings/vendor-settings/lead-time',
                  permissionsArray: ['readSettings'],
                },
              ],
            },
            {
              title: 'Buyer Settings',
              key: '__settings_buyers',
              permissionsArray: ['readSettings'],
              children: [
                {
                  title: 'Buyer Groups',
                  key: '__settings_buyers_groups',
                  url: '/settings/buyer-settings/buyer-groups',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Buyer Warehouses',
                  key: '__settings_buyers_warehouses',
                  url: '/settings/buyer-settings/buyer-warehouses',
                  permissionsArray: ['readSettings'],
                },
              ],
            },
            {
              title: 'Material Settings',
              key: '__settings_materials',
              permissionsArray: ['readSettings'],
              children: [
                {
                  title: 'Material Categories',
                  key: '__settings_materials_categories',
                  url: '/settings/material-settings/categories',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Material Subcategories',
                  key: '__settings_materials_subcategories',
                  url: '/settings/material-settings/subcategories',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Material Colors',
                  key: '__settings_materials_colors',
                  url: '/settings/material-settings/colors',
                  permissionsArray: ['readSettings'],
                },
              ],
            },
            {
              title: 'Product Settings',
              key: '__settings_products',
              permissionsArray: ['readSettings'],
              children: [
                {
                  title: 'Product Categories',
                  key: '__settings_products_categories',
                  url: '/settings/product-settings/categories',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Product Subcategories',
                  key: '__settings_products_subcategories',
                  url: '/settings/product-settings/subcategories',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Attributes',
                  key: '__settings_products_attributes',
                  url: '/settings/product-settings/attributes',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Attribute Values',
                  key: '__settings_products_attributevalues',
                  url: '/settings/product-settings/attribute-values',
                  permissionsArray: ['readSettings'],
                },
              ],
            },
            {
              title: 'QC Settings',
              key: '__settings_qc',
              permissionsArray: ['readSettings'],
              children: [
                {
                  title: 'AQL Levels',
                  key: '__settings_qc_aql_levels',
                  url: '/settings/qc-settings/aql-levels',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'General Defects',
                  key: '__settings_qc_general_defects',
                  url: '/settings/qc-settings/general-defects',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Product Specifications',
                  key: '__settings_qc_product_specifications',
                  url: '/settings/qc-settings/product-specifications',
                  permissionsArray: ['readSettings'],
                },
              ],
            },
            {
              title: 'Inventory Settings',
              key: '__settings_inventory',
              permissionsArray: ['readSettings'],
              children: [
                {
                  title: 'Return Reason Category',
                  key: '__settings_inventory_return_reason_category',
                  url: '/settings/inventory-settings/return-reason-categories',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Return Reason',
                  key: '__settings_inventory_return_reasons',
                  url: '/settings/inventory-settings/return-reasons',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Unsalable Reason',
                  key: '__settings_inventory_unsalable_reason',
                  url: '/settings/inventory-settings/unsalable-reason',
                  permissionsArray: ['readSettings'],
                },
              ],
            },
            {
              title: 'Expense Settings',
              key: '__settings_expense',
              permissionsArray: ['readSettings'],
              children: [
                {
                  title: 'Expense Categories',
                  key: '__settings_expense_categories',
                  url: '/settings/expense-settings/categories',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Expense Subcategories',
                  key: '__settings_expense_subcategories',
                  url: '/settings/expense-settings/subcategories',
                  permissionsArray: ['readSettings'],
                },
              ],
            },
            {
              title: 'Misc',
              key: '__settings_misc',
              permissionsArray: ['readSettings'],
              children: [
                {
                  title: 'Units of Measurement',
                  key: '__settings_misc_uom',
                  url: '/settings/misc/uom',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'HSNs',
                  key: '__settings_misc_hsn',
                  url: '/settings/misc/hsn',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Organizations',
                  key: '__settings_misc_organizations',
                  url: '/settings/misc/organizations',
                  permissionsArray: ['readSettings'],
                },
                {
                  title: 'Brands',
                  key: '__settings_misc_brands',
                  url: '/settings/misc/brands',
                  permissionsArray: ['readSettings'],
                },
              ],
            },
          ],
        },
      ],
    },
  ]
}
