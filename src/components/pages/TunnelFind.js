import React from "react";
import io from "socket.io-client";
import { Redirect } from "react-router-dom";

class TunnelFind extends React.Component {
  state = { found: false, rejected: false, url: "" };

  componentDidMount() {}
  onFormSubmit = event => {
    event.preventDefault();
    this.setState({ url: `https://${this.state.code}.ngrok.io` });
    io("http://localhost:3004").on("mac", mac => {
      console.log(mac);
      this.setState({ mac: mac });
      this.authenticate();
    });
  };

  authenticate = () => {
    io(this.state.url, { query: `mac=${this.state.mac}` }).on(
      "confirmation",
      ans => {
        console.log(ans);
        this.setState({ authenticated: ans, rejected: !ans });
      }
    );
    this.setState({ authenticated: true });
  };
  authenticated = () => {
    return <Redirect push to="connected" />;
  };
  rejected = () => {
    return (
      <div className="ui segment big" style={{ top: "20vh" }}>
        <div className="ui icon message negative huge">
          <i className="thumbs down icon red" />
          <div className="content">
            <div className="header">Error authenticating</div>
            <p>Seems like they don't want you in here...</p>
          </div>
        </div>
      </div>
    );
  };
  enterCode = () => {
    return (
      <div className="ui segment">
        <div
          className="ui info message massive"
          style={{ textAlign: "center" }}
        >
          <i className="close icon" />
          <div className="header">Connect Via Tunnel</div>
          <ul className="list">
            <li>Enter the code displayed by your ArByte</li>
            <li>If no code is shown, reboot your device!</li>
          </ul>
        </div>
        <div className="ui segment placeholder">
          <form
            className="ui form"
            onSubmit={this.onFormSubmit}
            value={this.state.code}
            onChange={event => {
              this.setState({ code: event.target.value });
            }}
          >
            <div className="field huge" style={{ textAlign: "center" }}>
              <label style={{ fontSize: "150%" }}>Tunnel Code:</label>
              <input type="text" />
            </div>
          </form>
        </div>
      </div>
    );
  };

  waitingForConnection() {
    return (
      <div className="ui segment big" style={{ top: "20vh" }}>
        <div className="ui icon message huge">
          <i className="notched circle loading icon black" />
          <div className="content">
            <div className="header">Hang in there!</div>
            <p>We're looking for your ArByte</p>
          </div>
        </div>
      </div>
    );
  }
  render() {
    return this.state.authenticated
      ? this.authenticated()
      : this.state.rejected
      ? this.rejected()
      : this.state.url !== ""
      ? this.waitingForConnection()
      : this.enterCode();
  }
}

export default TunnelFind;
