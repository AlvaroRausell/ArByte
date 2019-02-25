import React from "react";

const Connected = () => {
  return (
    <div className="ui segment big" style={{ top: "20vh" }}>
      <div className="ui info icon message">
        <i className="check circle blue icon" />
        <div className="content">
          <div className="header">You're now connected!</div>
          <p>Sharing directory: ~/files/</p>
        </div>
      </div>
    </div>
  );
};

export default Connected;
