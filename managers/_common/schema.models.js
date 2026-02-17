const emojis = require("../../public/emojis.data.json");

module.exports = {
  id: {
    path: "id",
    type: "string",
    length: { min: 1, max: 50 },
  },
  username: {
    path: "username",
    type: "string",
    length: { min: 3, max: 20 },
    custom: "username",
  },
  password: {
    path: "password",
    type: "string",
    length: { min: 6, max: 100 },
  },
  email: {
    path: "email",
    type: "string",
    length: { min: 3, max: 100 },
    custom: "email",
  },
  title: {
    path: "title",
    type: "string",
    length: { min: 3, max: 300 },
  },
  label: {
    path: "label",
    type: "string",
    length: { min: 3, max: 100 },
  },
  shortDesc: {
    path: "desc",
    type: "string",
    length: { min: 3, max: 300 },
  },
  longDesc: {
    path: "desc",
    type: "string",
    length: { min: 3, max: 2000 },
  },
  url: {
    path: "url",
    type: "string",
    length: { min: 9, max: 300 },
  },
  emoji: {
    path: "emoji",
    type: "Array",
    items: {
      type: "string",
      length: { min: 1, max: 10 },
      oneOf: emojis.value,
    },
  },
  price: {
    path: "price",
    type: "number",
  },
  avatar: {
    path: "avatar",
    type: "string",
    length: { min: 8, max: 100 },
  },
  text: {
    type: "String",
    length: { min: 3, max: 15 },
  },
  longText: {
    type: "String",
    length: { min: 3, max: 250 },
  },
  paragraph: {
    type: "String",
    length: { min: 3, max: 10000 },
  },
  phone: {
    type: "string",
    length: { min: 7, max: 15 },
  },
  number: {
    type: "number",
    length: { min: 1, max: 6 },
  },
  arrayOfStrings: {
    type: "Array",
    items: {
      type: "string",
      length: { min: 3, max: 100 },
    },
  },
  obj: {
    type: "Object",
  },
  bool: {
    type: "Boolean",
  },
  limit: {
    type: "number",
    length: { min: 1, max: 10 },
  },
  page: {
    type: "number",
    length: { min: 1, max: 5 },
  },
  dateOfBirth: {
    type: "string",
    regex: /^\d{4}-\d{2}-\d{2}$/,
  },
  name: {
    path: "name",
    type: "string",
    length: { min: 3, max: 100 },
  },
  school: {
    path: "school",
    type: "string",
    length: { min: 3, max: 100 },
  },
  classrooms: {
    type: "Array",
    items: {
      type: "string",
      length: { min: 3, max: 100 },
    },
  },
  studentPicture: {
    type: "string",
    length: { min: 3, max: 300 },
  },
  enrolledAt: {
    type: "string",
    regex: /^\d{4}-\d{2}-\d{2}$/,
  },
  capacity: {
    path: "capacity",
    type: "number",
    length: { min: 1, max: 40 },
  },
  address: {
    type: "string",
    length: { min: 3, max: 500 },
  },
  // School fields
  schoolName: {
    path: "schoolName",
    type: "string",
    length: { min: 3, max: 100 },
  },
  schoolEmail: {
    path: "schoolEmail",
    type: "string",
    length: { min: 3, max: 100 },
    custom: "email",
  },
  schoolAddress: {
    path: "schoolAddress",
    type: "string",
    length: { min: 3, max: 500 },
  },
  schoolPhone: {
    path: "schoolPhone",
    type: "string",
    length: { min: 7, max: 20 },
  },
  // Student fields
  studentName: {
    path: "studentName",
    type: "string",
    length: { min: 3, max: 100 },
  },
  studentBirth: {
    path: "studentBirth",
    type: "string",
    regex: /^\d{4}-\d{2}-\d{2}$/,
  },
  studentPic: {
    path: "studentPic",
    type: "string",
    length: { min: 3, max: 300 },
  },
};
