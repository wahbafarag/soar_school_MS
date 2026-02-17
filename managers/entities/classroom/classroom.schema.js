module.exports = {
  createClassroom: [
    { model: "name", required: true },
    { model: "school", required: true },
    { model: "capacity", required: true },
  ],
  updateClassroom: [
    { model: "name", required: false },
    { model: "capacity", required: false },
  ],
};
