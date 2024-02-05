import React, { Component } from "react";
// prettier-ignore
import { Input, Select, DatePicker, Button, InputNumber, Popconfirm, Icon, notification } from "antd";
import moment from "moment";
import { Query } from "react-apollo";
import { getBomCodeNames } from "Query/BOM";
import { GET_ECOMMERCE_BUYERS } from "Query/Buyer";
import { getSalesOrderNames } from "Query/SalesOrder";
import { getAllInventoryQuery } from "Query/Inventory";
import HelperFunction from "Helpers/HelperFunction";
import TableComponent from "components/TableComponent";
import { validation } from "./validation";
import "./style.scss";

const { Option } = Select;

class RTVForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buyerId: "0",
      customBuyerName: null,
      tableData: [],
      // prettier-ignore
      count: props.isEdit
        ? Number(props.editRTVData.rtvData[props.editRTVData.rtvData.length - 1].id) + 1
        : 1,
      errors: {}
    };
  }

  componentWillMount() {
    const { editRTVData, isEdit } = this.props;

    if (isEdit && editRTVData && Object.keys(editRTVData).length) {
      this.setState({
        rtvName: editRTVData.rtvName,
        buyerId: String(editRTVData.buyerId),
        inventoryId: String(editRTVData.inventoryId),
        customBuyerName: editRTVData.customBuyerName,
        againstSO: editRTVData.againstSO
          ? editRTVData.againstSO.map(soID => String(soID))
          : null,
        rtvReceivedOn: moment(Number(editRTVData.rtvReceivedOn)),
        status: String(editRTVData.status),
        tableData: editRTVData.rtvData.map(obj => {
          return {
            key: Number(obj.id),
            quantity: Number(obj.quantity),
            bomCode: String(obj.bomCodeId)
          };
        })
      });
    }
  }

  onChange = (e, key, column) => {
    let newTableData = this.state.tableData.map(row => {
      if (row.key === key) return { ...row, [column]: e };
      return row;
    });
    this.setState({ tableData: newTableData });
  };

  addRow = () => {
    const { tableData, count } = this.state;
    const newTableData = [
      ...tableData,
      {
        key: count + 1,
        quantity: 1
      }
    ];
    this.setState({
      tableData: newTableData,
      count: count + 1
    });
  };

  deleteRow = key => {
    const tableData = [...this.state.tableData];
    const newTableData = tableData.filter(item => item.key !== key);
    this.setState({ tableData: newTableData });
  };

  savePrinterPO = () => {
    const { submitMutation, editRTVId, isEdit } = this.props;
    // prettier-ignore
    const { rtvName, buyerId, customBuyerName, rtvReceivedOn, status, tableData,
            againstSO, inventoryId } = this.state;
    const isFormInvalid = validation(this.state, this.props);
    // console.log("isFormInvalid: ", isFormInvalid);
    if (isFormInvalid) {
      this.setState({ errors: isFormInvalid });
      return;
    } else {
      let variables = {
        rtvName,
        buyerId: Number(buyerId),
        customBuyerName: Number(buyerId) === 0 ? customBuyerName : null,
        againstSO: againstSO.map(soID => Number(soID)),
        rtvReceivedOn: String(rtvReceivedOn.valueOf()),
        inventoryId: Number(inventoryId),
        rtvData: tableData.map(obj => ({
          // key: Number(obj.key),
          bomCodeId: Number(obj.bomCode),
          quantity: Number(obj.quantity)
        }))
      };
      if (isEdit) {
        variables = { ...variables, editRTVId: Number(editRTVId) };
        delete variables.inventoryId;
      }
      // console.log("variables: ", variables);

      submitMutation({ variables })
        .then(res => {
          if (res) {
            notification.success({
              message: "Success",
              description: "RTV operation successful"
            });
            this.props.history.push("/inventory/rtv/all");
          }
        })
        .catch(err => {
          return HelperFunction.throwError(
            HelperFunction.errorMessage(err.message),
            "error"
          );
        });
    }
  };

  render() {
    // console.log("State --> ", this.state);
    // console.log("Props --> ", this.props);
    const { editRTVId, isEdit } = this.props;
    // prettier-ignore
    const { errors, rtvName, buyerId, customBuyerName, rtvReceivedOn, status,
            tableData, againstSO, inventoryId } = this.state;
    const dateFormat = "YYYY/MM/DD";

    const columns = [
      {
        title: "Product",
        dataIndex: "bomCode",
        key: "bomCode",
        type: "number",
        width: "45%",
        sort: true,
        filter: false,
        render: (text, record) => (
          <Query query={getBomCodeNames}>
            {({ loading, error, data }) => {
              if (loading) return null;
              if (error) return `Error ${error}`;
              const bomCodes = data.getBomCodeNames;
              return (
                <Select
                  // disabled={!isEdit}
                  onChange={e => this.onChange(e, record.key, "bomCode")}
                  id="bomCode"
                  value={text}
                  style={{ width: "100%" }}
                  placeholder="Please select one"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {bomCodes.length
                    ? bomCodes.map(({ id, name }) => (
                        <Option key={id} value={String(id)}>
                          {name}
                        </Option>
                      ))
                    : null}
                </Select>
              );
            }}
          </Query>
        )
      },
      {
        title: "Qty. Returned",
        dataIndex: "quantity",
        key: "quantity",
        type: "number",
        sort: false,
        filter: false,
        width: "45%",
        render: (text, record) => (
          <InputNumber
            style={{ width: "100%" }}
            // disabled={!isEdit}
            min={1}
            value={text}
            onChange={e => this.onChange(e, record.key, "quantity")}
          />
        )
      },
      {
        title: "",
        dataIndex: "deleteRow",
        type: "number",
        sort: false,
        filter: false,
        // width: "20%",
        render: (text, record) => (
          <Popconfirm
            title="Sure to delete? Any product already put in shelves will be deleted."
            onConfirm={() => this.deleteRow(record.key)}
          >
            <Button type="danger">
              <Icon type="delete" />
            </Button>
          </Popconfirm>
        )
      }
    ];

    return (
      <div className="card">
        <div className="card-header">
          <div className="utils__title text-center font-weight-bold font-size-20">
            RTV Form
          </div>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-lg-2">
              <label htmlFor="date">RTV ID</label>
              <br />
              <Input
                value={rtvName}
                placeholder="Enter name of RTV"
                onChange={({ target: { value } }) =>
                  this.setState({ rtvName: value })
                }
              />
              <span className="errorStyle">{errors.rtvName || ""}</span>
            </div>

            <div className="col-lg-2">
              <label htmlFor="buyer">Buyer</label>
              <br />
              <Query query={GET_ECOMMERCE_BUYERS}>
                {({ loading, error, data }) => {
                  if (loading) return null;
                  if (error) return `Error ${error}`;

                  const buyers = data.getECommerceBuyers;
                  return (
                    <Select
                      value={buyerId || null}
                      style={{ width: "100%" }}
                      placeholder="Select a vendor"
                      onChange={buyerId => this.setState({ buyerId })}
                      showSearch
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option key="0" value="0">
                        CUSTOM BUYER
                      </Option>
                      {buyers.length
                        ? buyers.map(buyer => (
                            <Option key={buyer.id} value={String(buyer.id)}>
                              {`${buyer.name} (${buyer.buyerGroupName})`}
                            </Option>
                          ))
                        : null}
                    </Select>
                  );
                }}
              </Query>
              <span className="errorStyle">{errors.buyerId || ""}</span>
            </div>

            <div className="col-lg-2">
              <label htmlFor="date">Custom Buyer Name</label>
              <br />
              <Input
                disabled={!!Number(buyerId)}
                value={customBuyerName}
                placeholder="Enter name of buyer"
                onChange={({ target: { value } }) =>
                  this.setState({ customBuyerName: value })
                }
              />
              <span className="errorStyle">{errors.customBuyerName || ""}</span>
            </div>

            <div className="col-lg-2">
              <label htmlFor="rtvReceivedOn">RTV Received On</label>
              <br />
              <DatePicker
                format={dateFormat}
                placeholder="Select a date"
                value={rtvReceivedOn || null}
                onChange={rtvReceivedOn => this.setState({ rtvReceivedOn })}
                style={{ width: "100%" }}
              />
              <span className="errorStyle">{errors.rtvReceivedOn || ""}</span>
            </div>

            <div className="col-lg-2">
              <label htmlFor="status">Against Sales Order(s)</label>
              <Query query={getSalesOrderNames}>
                {({ loading, error, data }) => {
                  if (loading) return null;
                  if (error) return `Error ${error}`;

                  const salesOrders = data.getSalesOrderNames;
                  return (
                    <Select
                      mode="multiple"
                      value={againstSO || []}
                      style={{ width: "100%" }}
                      placeholder="Select a vendor"
                      onChange={againstSO => this.setState({ againstSO })}
                      showSearch
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {salesOrders.length
                        ? salesOrders.map(({ id, name }) => (
                            <Option key={id} value={String(id)}>
                              {name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  );
                }}
              </Query>
              <span className="errorStyle">{errors.againstSO || ""}</span>
            </div>

            <div className="col-lg-2">
              <label htmlFor="inventory">Warehouse</label>
              <br />
              <Query query={getAllInventoryQuery}>
                {({ loading, error, data }) => {
                  if (loading) return null;
                  if (error) return `Error ${error}`;

                  const inventories = data.getAllInventory;
                  return (
                    <Select
                      disabled={isEdit}
                      value={inventoryId || null}
                      style={{ width: "100%" }}
                      placeholder="Select a vendor"
                      onChange={inventoryId => this.setState({ inventoryId })}
                      showSearch
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {inventories.length
                        ? inventories.map(obj => (
                            <Option key={obj.id} value={String(obj.id)}>
                              {`${obj.unitNumber} (${obj.location})`}
                            </Option>
                          ))
                        : null}
                    </Select>
                  );
                }}
              </Query>
              <span className="errorStyle">{errors.inventoryId || ""}</span>
            </div>
          </div>
          <br />

          <div className="row">
            <div className="col-5">
              <div>
                <span className="font-weight-bold font-size-16">Products</span>
                <Button
                  // disabled={!!viewOnly}
                  className="pull-right"
                  size="small"
                  type="primary"
                  onClick={this.addRow}
                >
                  Add row
                </Button>
              </div>
              <TableComponent
                columns={columns}
                dataSource={tableData}
                pagination={false}
                scroll={false}
              />
              <br />
              <br />
              <div>
                <Button type="primary" onClick={this.savePrinterPO}>
                  Save
                </Button>
                &nbsp;<Button>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RTVForm;
