import React from "react";
import { Redirect } from "react-router-dom";
import io from "socket.io-client";

class LANFind extends React.Component {
  state = {
    found: false,
    notThere: false,
    ip: -1,
    authenticated: false,
    rejected: false
  };
  componentDidMount() {
    //FIND THE PI AND CHANGE THE STATE
    const socket = io("http://localhost:3002");
    socket.on("ip", ip => {
      console.log(ip);
      if (ip === -1) this.setState({ notThere: true });
      else {
        this.setState({ found: true, ip: ip });
        io("http://localhost:3004").on("mac", mac => {
          console.log(mac);
          this.setState({ mac: mac });
          this.authenticate();
        });
      }
    });
  }
  findMac = () => {};
  authenticate = () => {
    console.log(this.state.ip);
    const socket = io(`${this.state.ip}:3016`, {
      query: `mac=${this.state.mac}`
    });

    socket.on("confirmation", ans => {
      console.log(ans);
      this.setState({ authenticated: ans, rejected: !ans });
    });
  };
  looking = () => {
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
  };

  found = () => {
    return (
      <div className="ui segment big" style={{ top: "20vh" }}>
        <div className="ui success icon message huge">
          <i className="notched circle loading icon green" />
          <div className="content">
            <div className="header">We found your ArByte!</div>
            <p>We're now authenticating you, this won't take long</p>
          </div>
        </div>
      </div>
    );
  };

  notThere = () => {
    return (
      <div className="ui segment big" style={{ top: "20vh" }}>
        <div className="ui icon message negative huge">
          <i className="thumbs down icon red" />
          <div className="content">
            <div className="header">Something went wrong! :(</div>
            <p>Try rebooting your ArByte and the client!</p>
          </div>
        </div>
      </div>
    );
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
  render() {
    return !this.state.found && !this.state.notThere
      ? this.looking()
      : this.state.found
      ? this.state.authenticated
        ? this.authenticated()
        : this.state.rejected
        ? this.rejected()
        : this.found()
      : this.notThere();
  }
}

export default LANFind;
