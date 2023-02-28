const express = require("express");
const router = express.Router();
const chatData = require("../model/userModel");
const statusData = require("../model/statusId");
const chatHistory = require("../model/chatHistory");

//====>>>>>>>>>>>>> to get user contact list
router.post("/myContact", async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await chatData.findOne({ phoneNumber });
  res.status(200).send(user?.contactList);
});

//==============>>>>>>>> To Add New Contact
router.post("/addContact", async (req, res) => {
  const { phoneNumber, contact } = req?.body;

  const userDetails = await chatData.findOne({ phoneNumber });
  const isPresent = await userDetails.contactList.filter(
    (item) => item?.number === contact
  );

  if (!isPresent[0]) {
    const contactUser = await chatData.findOne({ phoneNumber: contact });
    if (contactUser) {
      const data = {
        name: contactUser.username,
        number: contactUser.phoneNumber,
      };

      userDetails?.contactList?.push(data);

      await userDetails.save();

      res.status(200).send({ data: userDetails?.contactList });
    } else {
      res.status(400).send({ message: "This user is not registered" });
    }
  } else {
    res.status(200).send({ data: userDetails?.contactList });
  }
});

//========>>>>>>>>>> get user status =================
router.post("/getStatus", async (req, res) => {
  const { phoneNumber, userNumber } = req.body;
  const chats = await chatHistory.findOne({
    key: `${userNumber}${phoneNumber}`,
  });
  const isPresent = await statusData.findOne({ phoneNumber });
  if (isPresent) {
    res.status(200).json({ status: true, chats: chats ? chats.chatData : [] });
  } else {
    res.status(200).json({ status: false, chats: chats ? chats.chatData : [] });
  }
});

//=========== login and register user
router.post("/login", async (req, res) => {
  const { username, phoneNumber } = req.body;

  const isPresent = await chatData.findOne({ phoneNumber });

  if (isPresent) {
    res.status(200).send({ username, phoneNumber });
  } else {
    const newUser = new chatData({
      username,
      phoneNumber,
    });
    await newUser.save();
    res.status(200).send({
      username,
      phoneNumber,
    });
  }
});

module.exports = router;
