import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./InitialScreen.css";
import "./ConnectOption";
class InitialScreen extends Component {
  render() {
    return (
      <div>
        <div className="segment init">
          <br />
          <br />
          <br />
          <div className="welcome-text">
            <h1 className="ui header welcome">
              Welcome to Arbyte!
              <br />
              Select one of the following options:
            </h1>
            <br />
            <br />
          </div>

          <div className="main ui segment placeholder">
            <div className="have">
              <Link to="connectopt">
                <button className="ui button align left primary">
                  Connect to my ArByte
                </button>
              </Link>
            </div>
            <div className="register">
              <Link to="register">
                <button className="ui button">Register my ArByte</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default InitialScreen;
