import React from "react";
import Page from "components/LayoutComponents/Page";
import Helmet from "react-helmet";
import Form from "./form";

class viewOnlyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Transfer Outward" />
        <Form {...props} />
      </Page>
    );
  }
}
export default viewOnlyComponent;
