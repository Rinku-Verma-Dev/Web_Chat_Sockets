import React, { useState } from "react";
import io from "socket.io-client";
import Chat from "./chat/chat";

import Login from "./login/login";

const socket = io.connect("http://192.168.3.203:5000/");
// const socket = io.connect("http://192.168.1.8:5000/");
function App() {
  const userLogin = JSON.parse(localStorage.getItem("chat-Login"));
  const [userId, setUserId] = useState(userLogin);

  return (
    <>
      {userId ? (
        <Chat socket={socket} userId={userId} />
      ) : (
        <Login setUserId={setUserId} socket={socket} />
      )}
    </>
  );
}

export default App;
