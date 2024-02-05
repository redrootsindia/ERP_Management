export const cloudtailColHeaders = [
  'PO',
  'Vendor',
  'Warehouse',
  'Model Number',
  'ASIN',
  'SKU',
  'Title',
  'Status',
  'Deliver From',
  'Deliver To',
  'Expected Delivery Date',
  'Confirmed delivery date',
  'Submitted Quantity',
  'Accepted Quantity',
  'Received Quantity',
  'Outstanding Quantity',
  'Unit Cost',
  'Total Cost',
]

export const cloudtailColumns = [
  { data: 'po' },
  { data: 'vendor' },
  { data: 'warehouse' },
  { data: 'model_number' },
  { data: 'asin' },
  { data: 'sku' },
  { data: 'title' },
  { data: 'status' },
  { data: 'deliver_from' },
  { data: 'deliver_to' },
  { data: 'expected_delivery_date' },
  { data: 'confirmed_delivery_date' },
  { data: 'submitted_quantity' },
  { data: 'accepted_quantity' },
  { data: 'received_quantity' },
  { data: 'outstanding_quantity' },
  { data: 'unit_cost' },
  { data: 'total_cost' },
]

export const ajioHeaders = [
  'PO Number',
  'Site',
  'Vendor',
  'Vendor Name',
  'Region',
  'REGION',
  'City',
  'Tax Desc.',
  'Old Article No.',
  'EAN No.',
  'Article',
  'Article Desc.',
  'Season',
  'Season Year',
  'Brand',
  'Brand Desc.',
  'Pur.Group',
  'Deliv. Date',
  'Payment Terms',
  'MRP-1(ZMR1)',
  'Item Price',
  'Incl. Tax Value(ZDC2)',
  'Vendor Dis (% MRP)(ZDC0)',
  'Sales price(VKP0)',
  'PO Qty',
  'UoM',
  'Gross Price(PB00)',
  'Gross Price(PBXX)',
  'Gross Cost((PB00+PBXX)*(1+IPtax))',
  'Total Gross((PB00+PBXX)*PO Qty)',
  'Intake Margin%(intake margin/VKP0)*100)',
]

export const ajioColumns = [
  { data: 'po' },
  { data: 'site' },
  { data: 'vendor' },
  { data: 'vendor_name' },
  { data: 'region1' },
  { data: 'region2' },
  { data: 'city' },
  { data: 'tax_desc' },
  { data: 'old_article_mo' },
  { data: 'ean_no' },
  { data: 'article' },
  { data: 'article_desc' },
  { data: 'season' },
  { data: 'season_year' },
  { data: 'brand' },
  { data: 'brand_desc' },
  { data: 'pur_grp' },
  { data: 'deliv_date' },
  { data: 'payment_terms' },
  { data: 'zmr1' },
  { data: 'item_price' },
  { data: 'zdc2' },
  { data: 'zdc0' },
  { data: 'sales_price' },
  { data: 'po_qty' },
  { data: 'uom' },
  { data: 'pb_00' },
  { data: 'pb_xx' },
  { data: 'gross_cost' },
  { data: 'total_gross' },
  { data: 'intake_margin' },
]

export const marketplaceHeaders = [
  'Shipment',
  'Gift Message(s)',
  'Item Contains',
  'Products',
  'Channel',
  'Status',
  'Picklist',
  'Invoice No.',
  'On Hold',
  'State',
  'Fulfillment TAT',
  'Regulatory Forms',
  'Batch #',
  'Shipping',
  'Payment Method',
  'Created',
  'Display Order #',
  'Shipment',
  'ContainsGiftWrap',
  'ChannelID',
  'Item Type SKUs',
  'Item Type Ids',
  'Seller SKUs',
  'Item Id Details',
  'Seller SKU Details',
  'Shipping Provider',
  'Shipping Provider Code',
  'AWB',
  'Dispatch Time',
  'Shipping Arranged By',
  'Product Mgmt Switched Odd',
  'Label Format',
  'Item Detailing Pending',
  'Putaway Pending',
  'Weight',
  'Length',
  'Width',
  'Height',
  'Package Type',
  'Number Of Boxes',
  'SAILN',
  'OrderItemIds',
]

export const marketplaceColumns = [
  { data: 'shipment' },
  { data: 'messages' },
  { data: 'contains' },
  { data: 'products' },
  { data: 'channel' },
  { data: 'status' },
  { data: 'picklist' },
  { data: 'invoice' },
  { data: 'hold' },
  { data: 'state' },
  { data: 'tat' },
  { data: 'forms' },
  { data: 'batch' },
  { data: 'shipping' },
  { data: 'payment_method' },
  { data: 'created' },
  { data: 'display_order_no' },
  { data: 'shipment_2_ignore' },
  { data: 'contains_gift_wrap' },
  { data: 'channel_id' },
  { data: 'item_type_SKUs' },
  { data: 'item_Type_Ids' },
  { data: 'seller_SKUs' },
  { data: 'item_id_details' },
  { data: 'seller_SKU_details' },
  { data: 'shipping_provider' },
  { data: 'shipping_provider_code' },
  { data: 'awb' },
  { data: 'dispatch_time' },
  { data: 'shipping_arranged_by' },
  { data: 'Product_mgmt_switched_odd' },
  { data: 'label_format' },
  { data: 'item_detail_pending' },
  { data: 'putaway_pending' },
  { data: 'weight' },
  { data: 'length' },
  { data: 'width' },
  { data: 'height' },
  { data: 'package_type' },
  { data: 'number_of_boxes' },
  { data: 'SAILN' },
  { data: 'order_item_ids' },
]
