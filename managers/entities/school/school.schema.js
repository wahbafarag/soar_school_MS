module.exports = {
  createSchool: [
    { model: "schoolName", required: true },
    { model: "schoolEmail", required: true },
    { model: "schoolAddress", required: true },
    { model: "schoolPhone", required: true },
  ],
  updateSchool: [
    { model: "schoolName", required: false },
    { model: "schoolEmail", required: false },
    { model: "schoolAddress", required: false },
    { model: "schoolPhone", required: false },
  ],
};
