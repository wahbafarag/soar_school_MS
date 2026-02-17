module.exports = {
  createStudent: [
    { model: "studentName", required: true },
    { model: "studentBirth", required: true },
    { model: "school", required: true },
    { model: "studentPic", required: false },
    { model: "classrooms", required: false },
  ],
  updateStudent: [
    { model: "studentName", required: false },
    { model: "studentBirth", required: false },
    { model: "studentPic", required: false },
    { model: "classrooms", required: false },
  ],
  transferStudent: [
    { model: "school", required: true },
  ],
};
