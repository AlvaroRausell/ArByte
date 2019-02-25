import React from "react";
import io from "socket.io-client";
import _ from "lodash";
import { Redirect } from "react-router-dom";
import "./WifiConnect.css";

class WifiConnect extends React.Component {
  state = { networks: [], selectedNetwork: {}, redirect: false, reboot: false };
  componentDidMount() {
    const socket = io("http://localhost:3001");

    this.findNetworks(socket);
  }

  findNetworks(socket) {
    console.log("finding!");
    socket.on("networks", data =>
      this.setState({
        networks: _.filter(_.uniqBy(data, "ssid"), data => {
          return data.security !== "none";
        })
      })
    );
  }

  onFormSubmit = event => {
    event.preventDefault();
    //!Do Whatever
    console.log("redirecting...");
    this.setState({ redirect: true });
  };
  getNetworkList() {
    console.log(this.state.networks.length);
    return this.state.networks.map(network => {
      return (
        <div
          key={network.bssid}
          className="item"
          onClick={() =>
            this.setState({ selectedNetwork: { ssid: network.ssid } })
          }
        >
          <div className="content">
            <div className="header">{network.ssid}</div>
            <div className="description">{network.bssid}</div>
          </div>
        </div>
      );
    });
  }

  renderChoose = () => {
    console.log("errrdey");

    if (this.state.selectedNetwork.ssid) {
      console.log(this.state.networks);
      return this.renderQuestion();
    } else {
      return this.renderList();
    }
  };
  renderList = () => {
    return (
      <div className="cont">
        <div
          className="ui segment head"
          style={{ textAlign: "center !important" }}
        >
          <h1 className="ui header">
            Select a Wi-Fi Network to connect ArByte to:
          </h1>
        </div>
        <div className="" style={{ marginTop: "10%" }}>
          <div className="ui segment placeholder">
            <div className="ui relaxed divided list">
              {this.getNetworkList()}
            </div>
          </div>
        </div>
      </div>
    );
  };
  renderQuestion = () => {
    return (
      <div className="cont">
        <div
          className="ui segment head"
          style={{ textAlign: "center !important" }}
        >
          <h1 className="ui header">
            Type the password for network:&nbsp;
            <strong>
              <em>{` ${this.state.selectedNetwork.ssid}`}</em>
            </strong>
          </h1>
        </div>
        <div className="" style={{ marginTop: "10%" }}>
          <div className="ui segment placeholder">
            <form className="ui form" onSubmit={this.onFormSubmit}>
              <div className="field">
                <label>Wi-Fi Password:</label>
                <input type="password" />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  render() {
    return this.state.redirect ? (
      <Redirect push to={{ pathname: "/", state: { reboot: true } }} />
    ) : this.state.networks.length !== 0 ? (
      this.renderChoose()
    ) : (
      <div className="ui icon message huge">
        <i className="notched circle loading icon black" />
        <div className="content">
          <div className="header">Just one second</div>
          <p>We're fetching the networks</p>
        </div>
      </div>
    );
  }
}

export default WifiConnect;
