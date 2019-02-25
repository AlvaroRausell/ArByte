import React from "react";
import { Link } from "react-router-dom";
const ConnectOption = () => {
  return (
    <div>
      <div className="segment init">
        <br />
        <br />
        <br />
        <div className="welcome-text">
          <h1 className="ui header welcome">
            Connect to ArByte
            <br />
            Choose the connection method:
          </h1>
          <br />
          <br />
        </div>

        <div className="main ui segment placeholder">
          <div className="have">
            <Link to="lanfind">
              <button className="ui button align left primary">
                Connect to my ArByte via LAN
              </button>
            </Link>
          </div>
          <div className="register">
            <Link to="tunnelfind">
              <button className="ui secondary button">
                Connect to my ArByte via Tunneling
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectOption;
