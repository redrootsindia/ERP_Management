import React from 'react';
import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';

import { Query } from 'react-apollo';
import { getStockTransferByIdQuery } from '../../../../Query/WarehouseManagement/stockTransfer';
import { getPartialPutAwayDataQuery } from '../../../../Query/WarehouseManagement/putAwayQueries';

import Form from '../../PutAway/PutAwayForm/putAwayForm';

class TransferInwardForm extends React.Component {
  static defaultProps = {
    abcd: { name: 'Put Away', path: '/inventory/putaway/appointments' },
    pathName: 'Warehouse',
    roles: ['agent', 'administrator'],
    accessRights: ['isViewDataValidation']
  };

  render() {
    const { path, params } = this.props.match;
    const { id } = params;
    let isNonScannerEdit = false;
    if (path.includes('non-scanner-edit')) isNonScannerEdit = true;

    return (
      <Page {...this.props}>
        <Helmet title="Put Away" />
        <Query query={getStockTransferByIdQuery} variables={{ stockTransferId: Number(id) }}>
          {({ loading: stLoad, error: stErr, data: stData }) => (
            <Query query={getPartialPutAwayDataQuery} variables={{ id: Number(id), type: 1 }}>
              {({ loading: pLoad, error: pErr, data: partialData }) => {
                if (stLoad || pLoad) return 'Loading....';
                if (stErr) return `${stErr.message}`;
                if (pErr) return `${pErr.message}`;

                // console.log("stData: ", stData);
                // console.log("partialData: ", partialData);

                const { getStockTransferById } = stData;

                let totalQuantity = 0;
                const orders = getStockTransferById.stockTransferMiddleDetail.map((item) => {
                  totalQuantity += item.quantity;
                  return {
                    id: item.id,
                    itemId: item.bomCodeData.id,
                    itemCode: item.bomCodeData.name,
                    quantity: item.quantity,
                    itemBarcode: item.bomCodeData.bomBarCode
                  };
                });

                let putAwayData = {
                  id: getStockTransferById.id,
                  poId: 0,
                  date: getStockTransferById.createdAt,
                  warehouseId: getStockTransferById.toInventoryData.id,
                  warehouseName: getStockTransferById.toInventoryData.unitNumber,
                  location: getStockTransferById.toInventoryData.location,
                  racks: getStockTransferById.toInventoryData.racks,
                  orders,
                  totalQuantity
                };

                // console.log('putAwayData: ', putAwayData);

                return (
                  <Form
                    putAwayData={putAwayData}
                    partialPutAwayData={partialData.getPartialPutAwayData}
                    type={1}
                    isNonScannerEdit={isNonScannerEdit}
                    {...this.props}
                  />
                );
              }}
            </Query>
          )}
        </Query>
      </Page>
    );
  }
}
export default TransferInwardForm;
