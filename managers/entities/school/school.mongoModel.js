const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
  },

  schoolEmail: {
    type: String,
    required: true,
  },

  schoolAddress: {
    type: String,
    required: true,
  },

  schoolPhone: {
    type: String,
    required: true,
  },

  schoolAdmins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const School = mongoose.model("School", schoolSchema);

module.exports = School;
