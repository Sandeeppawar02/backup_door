/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { checkPermissions } = require("../../middleware/admins");
const { modules, permissions } = require("../../utils/constants");

const {
  getComapny,
  getComapnyById,
  deleteUserById
} = require("./controller");

//show-role-by-role_id
app.get(
  "/admin/get_comapnies",
  // checkPermissions(modules.roles, "READ"),
  getComapny,
);


app.get(
  "/admin/get_comapnies/:id",
  // checkPermissions(modules.roles, "READ"),
  getComapnyById,
);

app.delete("/admin/delete-user/:id", deleteUserById)

module.exports = app;
