import { notification } from "antd";

export const validation = (state, props) => {
  // console.log("state", state);
  // console.log("props", props);

  let errorsPresent = false,
    errors = {
      tableData: null,
      rtvName: null,
      buyerId: null,
      customBuyerName: null,
      rtvReceivedOn: null,
      status: null,
      againstSO: null
    };

  // prettier-ignore
  const { tableData, rtvName, buyerId, customBuyerName, rtvReceivedOn, againstSO, inventoryId } = state;
  const { allRTVData, isEdit, editRTVData } = props;

  if (!rtvName) {
    errorsPresent = true;
    errors = {
      ...errors,
      rtvName: "Please enter a valid name / ID for this RTV"
    };
  } else if (
    (isEdit && rtvName.toLowerCase() !== editRTVData.rtvName.toLowerCase()) ||
    !isEdit
  ) {
    allRTVData.forEach(obj => {
      if (rtvName.toLowerCase() === obj.rtvName.toLowerCase()) {
        errorsPresent = true;
        errors = {
          ...errors,
          rtvName:
            "This name / ID already exists. Please choose a different one."
        };
      }
    });
  }

  if (!buyerId) {
    errorsPresent = true;
    errors = {
      ...errors,
      buyerId: "Please select a buyer"
    };
  }

  if (!Number(buyerId) && !customBuyerName) {
    errorsPresent = true;
    errors = {
      ...errors,
      customBuyerName: "Please enter a valid name for 'Custom Buyer'"
    };
  }

  if (!rtvReceivedOn) {
    errorsPresent = true;
    errors = {
      ...errors,
      rtvReceivedOn: "Please select the date when RTV was received"
    };
  }

  // if (!againstSO || !againstSO.length) {
  //   errorsPresent = true;
  //   errors = {
  //     ...errors,
  //     againstSO:
  //       "Please select sales orders against which RTV is being received."
  //   };
  // }

  if (!inventoryId) {
    errorsPresent = true;
    errors = {
      ...errors,
      inventoryId: "Please select a warehouse"
    };
  }

  if (!tableData.length) {
    errorsPresent = true;
    errors = {
      ...errors,
      tableData: "No products selected"
    };
  } else
    tableData.forEach(obj => {
      if (!obj.bomCode) {
        errorsPresent = true;
        errors = {
          ...errors,
          tableData:
            "Table contains rows with no product selected. Make sure to select products."
        };
      } else {
        if (!obj.quantity || Number(obj.quantity) <= 0) {
          errorsPresent = true;
          errors = {
            ...errors,
            tableData: `Value in 'Quantity' column in the table should be a valid number greater than 0.`
          };
        }
      }
    });

  if (errorsPresent && errors.tableData) {
    notification.error({
      message: "Error:",
      description: errors.tableData
    });
    return errors;
  } else if (errorsPresent) return errors;

  return false;
};
