import React from "react";

const Form = props => {
  return (
    <form
      className="ui huge form"
      onSubmit={props.onFormSubmit}
      style={{ width: "30%", margin: "auto" }}
    >
      <div className="field" style={{ textAlign: "center" }}>
        <label>{props.label1}</label>
        <input type="text" name="first-field" style={{ textAlign: "center" }} />
      </div>
      <div className="field" style={{ textAlign: "center" }}>
        <label>{props.label2}</label>
        <input
          type="text"
          name="second-field"
          style={{ textAlign: "center" }}
        />
      </div>
      <button
        className="ui button align center primary massive"
        type="submit"
        onClick={props.onFormSubmit}
        style={{ marginLeft: "23%" }}
      >
        Submit
      </button>
    </form>
  );
};

export default Form;
