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
  postRoles,
  putRolebyid,
  getRolebyid,
  getRoles,
  StatusRole,
  getallRole,
  deleteRole,
} = require("./controller");

//register-role
app.post(
  "/admin/postroles",
  checkPermissions(modules.roles, "WRITE"),
  postRoles,
);

//add-role
app.put(
  "/admin/update_role/:role_id",
  checkPermissions(modules.roles, "UPDATE"),
  putRolebyid,
);

//show-role-by-role_id
app.get(
  "/admin/get_roleId/:role_id",
  checkPermissions(modules.roles, "READ"),
  getRolebyid,
);

// ✅ Get all roles (paginated)
app.get("/admin/role_all", checkPermissions(modules.roles, "READ"), getRoles);

// ✅ Delete role by ID
app.delete(
  "/admin/deleterole/:role_id",
  checkPermissions(modules.roles, "DELETE"),
  deleteRole,
);

// ✅ Toggle role status (active/inactive)
app.put(
  "/admin/rolesStatus",
  checkPermissions(modules.roles, "UPDATE"),
  StatusRole,
);

// ✅ Get all active roles for dropdowns or listings
app.get(
  "/admin/getallRole",
  checkPermissions(modules.roles, "READ"),
  getallRole,
);

module.exports = app;
