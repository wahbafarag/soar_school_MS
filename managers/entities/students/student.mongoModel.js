const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true,
  },

  studentBirth: {
    type: Date,
    required: true,
  },

  enrolledAt: {
    type: Date,
    default: Date.now,
  },

  studentPic: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },

  classrooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
    },
  ],
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
