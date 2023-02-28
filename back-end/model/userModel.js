const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    require: true,
    trim: true,
  },
  roomIDs: {
    type: Array,
  },
  contactList: {
    type: Array,
  },
  chatHitory: {
    type: Array,
  },
});

const chatData = new mongoose.model("chatData", userSchema);
module.exports = chatData;
