const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  chatData: {
    type: Array,
  },
});

const chatHistory = new mongoose.model("chatHistory", chatSchema);
module.exports = chatHistory;
