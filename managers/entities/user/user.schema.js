module.exports = {
  createSuperAdmin: [
    {
      model: "username",
      required: true,
    },
    {
      model: "password",
      required: true,
    },
  ],
  createSchoolAdmin: [
    {
      model: "username",
      required: true,
    },
    {
      model: "password",
      required: true,
    },
  ],
  login: [
    {
      model: "username",
      required: true,
    },
    {
      model: "password",
      required: true,
    },
  ],
};
