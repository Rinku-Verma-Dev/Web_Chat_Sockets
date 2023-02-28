import React, { useRef } from "react";
import Profile from "../../svg/profile";
import axios from "axios";

import "./style.css";

export default function Login({ setUserId, socket }) {
  const idRef = useRef();
  const phnNumber = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = {
      username: idRef.current.value,
      phoneNumber: phnNumber.current.value,
    };
    axios
      .post("http://localhost:5000/login", data)
      .then((res) => {
        setUserId(res?.data);
        localStorage.setItem("chat-Login", JSON.stringify(res?.data));
      })
      .catch((e) => {
        console.log({ e });
      });
    socket.emit("login", data);
  };

  return (
    <>
      <div className="container d-flex">
        <div className="login-container d-flex">
          <Profile />
          <form className="login-form d-flex" onSubmit={handleSubmit}>
            <label>{`Username`}</label>
            <input
              type="text"
              placeholder="Enter your Name"
              ref={idRef}
              required
            />
            <label>{`Phone Number`}</label>
            <input
              type="tel"
              name="telphone"
              pattern="[0-9]{10}"
              placeholder="Enter your number"
              ref={phnNumber}
              required
            />

            <button type="submit">{`Submit`}</button>
          </form>
        </div>
      </div>
    </>
  );
}
