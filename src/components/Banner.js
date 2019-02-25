import React from "react";
import "./App.css";

import { Link } from "react-router-dom";
const Banner = () => {
  return (
    <div className="grid banner gradient">
      <br />
      <div className="align left header">
        <h1 className="ui header" style={{ marginTop: "" }}>
          <Link to="/">
            <i className="exchange icon" />
          </Link>
          ArByte
        </h1>
        <div className="usr-div">
          <i className="user circle big icon" style={{}} />
        </div>
      </div>
    </div>
  );
};

export default Banner;
