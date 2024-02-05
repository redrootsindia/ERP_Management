import { gql } from '@apollo/client'

export const WAREHOUSES = gql`
  query ($includeRackShelfData: Boolean) {
    warehouses(includeRackShelfData: $includeRackShelfData) {
      id
      name
      location
      active
      racks {
        id
        name
        active
        shelves {
          id
          name
          rack_id
          length
          breadth
          height
          active
        }
      }
    }
  }
`

export const WAREHOUSE = gql`
  query ($id: ID) {
    warehouse(id: $id) {
      id
      name
      location
      active
      racks {
        id
        name
        active
        shelves {
          id
          name
          rack_id
          length
          breadth
          height
          active
        }
      }
    }
  }
`

export const UPSERT_WAREHOUSE = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $name: String!
    $location: String!
    $racks: [RackInput!]!
    $deleted_racks: [ID]
    $deleted_shelves: [ID]
  ) {
    upsertWarehouse(
      upsertType: $upsertType
      id: $id
      name: $name
      location: $location
      racks: $racks
      deleted_racks: $deleted_racks
      deleted_shelves: $deleted_shelves
    )
  }
`

export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $status: Boolean!) {
    changeWarehouseStatus(id: $id, status: $status)
  }
`

export const SHELF_NAMES_BY_IDS = gql`
  query ($shelf_ids: [ID]) {
    shelfNamesByIDs(shelf_ids: $shelf_ids) {
      id
      name
      active
    }
  }
`

export const SHELVES_STOCK_IN_WAREHOUSE = gql`
  query ($warehouse_id: ID) {
    productStockOnShelvesByWarehouseID(warehouse_id: $warehouse_id) {
      quantity
      shelfData {
        id
        name
        rackData {
          id
          name
        }
      }
      productVariantData {
        id
        code
        ean
        product_id
      }
    }
  }
`

export const RACKS_OF_PRODUCT = gql`
  query ($warehouse_id: ID, $product_variant_id: ID) {
    racksOfProduct(warehouse_id: $warehouse_id, product_variant_id: $product_variant_id) {
      id
      rack_id
      shelf_id
      quantity
      rackData {
        id
        name
      }
      shelfData {
        id
        name
      }
    }
  }
`

export const PRODUCT_VARIANTS_IN_STOCK = gql`
  query ($warehouse_id: ID) {
    productsListByWarehouseID(warehouse_id: $warehouse_id) {
      id
      code
      ean
      product_id
    }
  }
`
