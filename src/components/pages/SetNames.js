import React from "react";
import { Redirect } from "react-router-dom";

import Form from "../Form";
class SetName extends React.Component {
  state = { redirect: false };
  onFormSubmit = event => {
    event.preventDefault();
    console.log("Do the things you gotta do :)");
    this.setState({ redirect: true });
  };
  render() {
    console.log(this.state.redirect);
    return this.state.redirect ? (
      <Redirect push to="connect" />
    ) : (
      <div className="register">
        <div className="ui segment main">
          <h1 className="ui header">Great! Let's now set some things:</h1>
        </div>
        <Form
          label1="How do you want to be called by ArByte?"
          label2="How do you want to call ArByte?"
          onFormSubmit={this.onFormSubmit}
        />
      </div>
    );
  }
}

export default SetName;
