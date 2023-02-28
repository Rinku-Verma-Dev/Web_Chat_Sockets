import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import AddIcon from "../../svg/addIcon";
import CloseIcon from "../../svg/closeIcon";
import ProfileSM from "../../svg/smallProfile";
import "./style.css";

export default function Chat({ socket, userId }) {
  // ===>>>>>>>>>>>>>>>>>>>>    REACT STATES
  const [currRoom, setCurrRoom] = useState();
  const [myContact, setMyContact] = useState();
  const [addClick, setAddClick] = useState(false);
  const [status, setStatus] = useState();
  const [receivedMessage, setReceivedMessage] = useState([]);
  const newMessage = useRef();
  const phnNumber = useRef();
  const scrolledMessage = useRef();

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>   USE EFFECTS
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setReceivedMessage((prev) => [...prev, data]);
      socket.emit("setMessage", data);
    });
  }, [socket]);

  useEffect(() => {
    axios.post("http://localhost:5000/myContact", userId).then((res) => {
      setMyContact(res?.data);
    });
  }, [userId]);

  useEffect(() => {
    socket.emit("login", userId);
    const scrollToBottom = () => {
      scrolledMessage.current.scrollTop = scrolledMessage.current.scrollHeight;
    };
    scrollToBottom();
    scrolledMessage.current.addEventListener("DOMNodeInserted", scrollToBottom);
    return () => {
      // eslint-disable-next-line
      scrolledMessage.current.removeEventListener(
        "DOMNodeInserted",
        scrollToBottom
      );
    }; // eslint-disable-next-line
  }, []);

  // >>>>>>>>>>>>>>>>>>>>>>>>>>> STATE HANDLER
  const handleAppContact = () => {
    const phoneNumber = {
      phoneNumber: userId?.phoneNumber,
      contact: phnNumber.current.value,
    };
    axios
      .post("http://localhost:5000/addContact", phoneNumber)
      .then((res) => {
        if (res?.statusText === "OK") {
          setMyContact(res?.data?.data);
        }
      })
      .catch((e) => {
        console.log({ error: e });
      });
    phnNumber.current.value = "";
  };

  const handleJoinRoom = (index) => {
    const roomID = {
      user: userId?.phoneNumber,
      contact: myContact[index]?.number,
    };

    axios
      .post("http://localhost:5000/getStatus", {
        phoneNumber: roomID.contact,
        userNumber: roomID.user,
      })
      .then((res) => {
        setStatus({ status: res.data.status });
        setReceivedMessage(res.data.chats);
      });
    socket.emit("joinRoom", roomID);
    socket.on("currRoom", (data) => {
      setCurrRoom(data);
    });
  };

  const sendMessage = async () => {
    if (newMessage.current.value.trim() !== "") {
      let date = new Date();
      let messageObj = {
        key: "send",
        from: userId?.phoneNumber,
        to: currRoom?.connectNumber,
        message: newMessage.current.value.trim(),
        time: `${date.getHours()}:${date.getMinutes()}`,
        username: userId.username,
        room: currRoom.room,
      };
      setReceivedMessage((prev) => [...prev, messageObj]);
      await socket.emit("sendMessage", messageObj);
      newMessage.current.value = "";
    }
  };

  const handleMessageOnEnter = (e) => {
    const { key } = e;
    if (key === "Enter") {
      sendMessage();
    }
  };

  const handleAddContact = () => {
    setAddClick(!addClick);
  };

  return (
    <>
      <div className="chat-dashboard">
        <div className="header">
          <ProfileSM />
          <h3>{userId?.username?.toUpperCase()}</h3>
        </div>
        <div className="wrapper">
          <div className="chat-rooms">
            {myContact?.map((item, i) => (
              <div
                className="contact-card"
                key={i}
                onClick={() => handleJoinRoom(i)}
              >
                <ProfileSM />
                <label>{item.name}</label>
              </div>
            ))}
            <div
              className={addClick ? "add-icon-none" : "add-icon"}
              onClick={handleAddContact}
            >
              <AddIcon />
            </div>
            <div className={addClick ? "add-chat" : "add-icon-none"}>
              <div onClick={handleAddContact} className="cross-btn">
                <CloseIcon />
              </div>
              <div className="input-search-add">
                <label>{`Phone Number: `}</label>
                <input
                  type="tel"
                  name="telphone"
                  pattern="[0-9]{10}"
                  placeholder="Search by number"
                  ref={phnNumber}
                  required
                />
                <button onClick={handleAppContact}>Add</button>
              </div>
            </div>
          </div>
          <div className="chat-room">
            <div className={currRoom ? "chat-section chat" : "chat"}>
              {currRoom && (
                <>
                  <div className="room-header">
                    <ProfileSM />
                    {currRoom?.name?.toUpperCase()}
                    {status?.status ? (
                      <div className="online"></div>
                    ) : (
                      <div className="offline"></div>
                    )}
                  </div>
                </>
              )}
              <div className="chat-area" ref={scrolledMessage}>
                {receivedMessage?.map((receivedItem, i) => (
                  <div
                    key={i}
                    className={
                      receivedItem?.key === "receive"
                        ? "received-massage"
                        : "js-content"
                    }
                  >
                    <span>
                      <ProfileSM />
                      <div className="receive-card">
                        {receivedItem?.message}
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="send-message">
              <input
                type="text"
                placeholder="Hey..."
                onKeyDown={handleMessageOnEnter}
                ref={newMessage}
              />
              {/* <button onClick={sendMessage}>&#9658;</button> */}
              <button onClick={sendMessage}>SEND</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
