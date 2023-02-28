const mongoose = require("mongoose");

const statusId = new mongoose.Schema({
  phoneNumber: {
    type: String,
    trim: true,
  },
  statusId: {
    type: String,
    trim: true,
  },
  status: {
    type: Boolean,
  },
});

const statusData = new mongoose.model("statusid", statusId);
module.exports = statusData;
