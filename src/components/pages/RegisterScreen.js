import React from "react";
import { Link } from "react-router-dom";

import "./RegisterScreen.css";
class RegisterScreen extends React.Component {
  render() {
    return (
      <div className="register">
        <div className="ui segment main">
          <h1 className="ui header">
            Connect to the hotspot created by the device!
          </h1>
        </div>
        <div
          className="ui info message massive"
          style={{ textAlign: "center" }}
        >
          <i className="close icon" />
          <div className="header">Can't find it?</div>
          <ul className="list">
            <li>Look for a network with the format ArByteXXXX</li>
            <li>
              Make sure you the device is turned on and not connected to any
              network
            </li>
          </ul>
        </div>
        <div className="ui segment placeholder">
          <Link to="setnames">
            <button className="ui button align center primary massive">
              Found it!
            </button>
          </Link>
        </div>
      </div>
    );
  }
}

export default RegisterScreen;
