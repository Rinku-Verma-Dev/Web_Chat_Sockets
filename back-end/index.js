const cors = require("cors");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const router = require("./routes/router");
const chatData = require("./model/userModel");
const statusData = require("./model/statusId");
const chatHistory = require("./model/chatHistory");
const app = express();

app.use(
  cors({
    // origin: "http://192.168.1.8:3000",
    origin: "http://192.168.3.203:3000",
  })
);

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/ChartData");

app.use(express.json());
app.use("/", router);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: "http://192.168.1.8:3000",
    origin: "http://192.168.3.203:3000",
    methods: ["GET", "POST"],
  },
});

const userList = [];
io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("login", async (data) => {
    const { phoneNumber } = data;
    const isPresent = await statusData.findOne({ phoneNumber });
    if (isPresent) {
      isPresent.statusId = socket.id;
      isPresent.status = true;
      isPresent.save();
    } else {
      const newUser = new statusData({
        phoneNumber,
        statusId: socket.id,
        status: true,
      });
      await newUser.save();
    }
  });

  socket.on("joinRoom", async (data) => {
    let roomID = `${Date.now() + Math.floor(Math.random() * 1000)}`;
    const user = await chatData.findOne({ phoneNumber: data?.user });
    const contact = await chatData.findOne({ phoneNumber: data?.contact });

    const isRoom = user.roomIDs.filter((item) => {
      return item.key === `${data?.contact}`;
    });

    if (isRoom[0]) {
      let room = `${isRoom[0].roomID}`;
      socket.join(room);
      room = {
        room,
        name: contact.username,
        connectNumber: contact.phoneNumber,
      };
      socket.emit("currRoom", room);
    } else {
      user?.roomIDs?.push({ key: data?.contact, roomID });
      contact?.roomIDs?.push({ key: data?.user, roomID });
      await user.save();
      await contact.save();
      socket.join(roomID);
      let room = {
        room: roomID,
        name: contact.username,
        connectNumber: contact.phoneNumber,
      };
      socket.emit("currRoom", room);
    }
  });

  socket.on("sendMessage", async (data) => {
    const room = `${data.room}`;
    const { to, from } = data;
    const isData = await chatHistory.findOne({ key: `${from}${to}` });
    if (isData) {
      isData.chatData.push(data);
      await isData.save();
    } else {
      const newUser = new chatHistory({
        key: `${from}${to}`,
        chatData: [],
      });
      newUser.chatData.push(data);
      await newUser.save();
    }
    data.key = "receive";

    const isDataPre = await chatHistory.findOne({ key: `${to}${from}` });
    if (isDataPre) {
      isDataPre.chatData.push(data);
      await isDataPre.save();
    } else {
      const newUser = new chatHistory({
        key: `${to}${from}`,
        chatData: [],
      });
      newUser.chatData.push(data);
      await newUser.save();
    }
    socket.to(room).emit("receiveMessage", data);
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);
    const find = await statusData.deleteOne({ statusId: socket.id });
  });

  socket.on("myContact", (data) => {
    let contactData = userList.filter((item) => data === item.roomID);
    socket.emit("getData", contactData);
  });
});

server.listen(5000, () => {
  console.log("http://192.168.3.203:5000/");
});
