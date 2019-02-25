import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import "./App.css";
import RegisterScreen from "./pages/RegisterScreen";
import ConnectOption from "./pages/ConnectOption";

import InitialScreen from "./pages/InitialScreen";
import SetNames from "./pages/SetNames";
import WifiConnect from "./pages/WifiConnect";
import Banner from "./Banner";
import LANFind from "./pages/LANFind";
import Connected from "./pages/Connected";
import TunnelFind from "./pages/TunnelFind";
const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Banner />

        <hr className="row" />
        <Route exact path="/" component={InitialScreen} />
        <Route path="/register" component={RegisterScreen} />
        <Route path="/setnames" component={SetNames} />
        <Route path="/connect" component={WifiConnect} />
        <Route path="/connectopt" component={ConnectOption} />
        <Route path="/lanfind" component={LANFind} />
        <Route path="/connected" component={Connected} />
        <Route path="/tunnelfind" component={TunnelFind} />
      </div>
    </BrowserRouter>
  );
};

export default App;
