/* eslint-disable no-unused-vars */
const Knex = require("../../../db/knex");
const pool = require("../../../db/dbConfig");
const { RegisterSchema } = require("./ValidationSchema");

// ✅ Create a new role after validating schema and checking for duplicates
const postRoles = async (req, res) => {
  try {
    const { error } = RegisterSchema.validate(req.body);
    const data = req.body;

    if (error) {
      res.status(400).send({ error: error.message });
      return;
    }

    const rolesname = req.body.name.trim();

    // ✅ Check for existing role name
    const getQuery = Knex("roles").where("name", rolesname).toString();
    const result = await pool.query(getQuery);
    if (result.rows[0]) {
      return res.status(400).send({ error: "Role already exists" });
    }

    // ✅ Remove role_id if present (prevent conflict)
    delete data.role_id;

    // ✅ Insert new role
    const insertQuery = Knex("roles").insert(data).returning("*").toString();
    const DBdata = await pool.query(insertQuery);

    res.status(200).json({
      status: true,
      results: DBdata.rows,
    });
  } catch (e) {
    console.error("Error inserting role:", e);
    res.sendStatus(500);
  }
};


// ✅ Update role by ID after validation and duplication check
const putRolebyid = async (req, res) => {
  try {
    const { error } = RegisterSchema.validate(req.body);
    const role_id = parseInt(req.params.role_id, 10);

    if (error) {
      res.status(400).send({ error: error.message });
      return;
    }

    // //Updated name should not be duplicate
    const getQuery = Knex("roles")
      .where("name", `${req.body.name}`)
      .andWhereNot({ role_id })
      .toString();
    const result = await pool.query(getQuery);
    if (result.rows[0]) {
      res.status(400).send({ error: "Role already exists" });
      return;
    }

    const data = req.body;
    const updateQuery = Knex("roles")
      .update(data)
      .where({ role_id: parseInt(req.params.role_id, 10) })
      .returning("*")
      .toString();
    const DBdata = await pool.query(updateQuery);

    res.status(200).json({
      status: true,
      results: DBdata.rows,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

// ✅ Get a single role by ID
const getRolebyid = async (req, res) => {
  try {
    //Fetching Role By Id
    const getQuery = Knex.from("roles")
      .select("*")
      .where({ role_id: parseInt(req.params.role_id, 10) })
      .toString();
    const result = await pool.query(getQuery);
    const data = result.rows[0];
    if (!data) {
      return res.send("no serach found");
    }
    const response = {
      message: "Get Role successful!",
      data: data,
    };
    res.status(200).json({
      status: true,
      results: response,
    });
  } catch (e) {
    res.sendStatus(500);
  }
};

// ✅ Get paginated list of all roles (excluding role_id 1)
const getRoles = async (req, res) => {
  try {
    const limit = 15;
    const offset = req.query.page ? parseInt(req.query.page) - 1 : 0;
    let totalcount = 0;
    let pages = 0;

    // Count roles
    const countQuery = Knex("roles as r")
      .count("r.role_id")
      .where("r.role_id", "!=", 1)
      .returning("*")
      .toString();
    const res_count = await pool.query(countQuery);

    totalcount = res_count.rows[0]["count"];
    pages = Math.ceil(totalcount / limit);

    //Fetching all Roles
    const getQuery = Knex("roles")
      .where("roles.role_id", "!=", 1)
      .offset(offset * limit)
      .limit(limit)
      .toString();
    const result = await pool.query(getQuery);

    res.status(200).json({
      status: true,
      data: result.rows,
      numberOfPages: pages,
      total: totalcount,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

// ✅ Toggle role status (true/false)
const StatusRole = async (req, res) => {
  try {
    const role_id = req.query.role_id;
    let userinfo = {};

    // check role status
    const checkuserexist = Knex("roles")
      .select("role_id", "name", "status")
      .where({ role_id })
      .toString();
    const resuserexist = await pool.query(checkuserexist);
    const status = resuserexist.rows[0].status;

    if (status === true) {
      const query = Knex("roles")
        .update({
          status: "false",
        })
        .where({ role_id })
        .returning("*")
        .toString();
      userinfo = await pool.query(query);
    } else if (status === false) {
      const query = Knex("roles")
        .update({
          status: "true",
        })
        .where({ role_id })
        .returning("*")
        .toString();
      userinfo = await pool.query(query);
    }
    res.status(200).json({
      status: true,
      results: userinfo.rows,
    });
  } catch (e) {
    res.sendStatus(500);
  }
};

// ✅ Get all active roles in `{ id, label }` format
const getallRole = async (req, res) => {
  try {
    const getQuery = Knex("roles")
      .select("role_id  as id", "name as label")
      .whereNot("role_id", 1) 
      .andWhere("status", true)
      .toString();
    const result = await pool.query(getQuery);
    return res.json({
      message: "Roles successful!",
      data: result.rows,
    });
  } catch (e) {
    res.sendStatus(500);
  }
};

// ✅ Delete a role if not assigned to a user (dummy check shown)
const deleteRole = async (req, res) => {
  try {
    const role_id = parseInt(req.params.role_id, 10) || 0;
    //check Role assigned to user or not
    const checkRole = Knex("roles")
      .select("roles")
      .where({ role_id })
      .toString();
    const dataToUpdate = await pool.query(checkRole);
    const res_role = dataToUpdate.rows[0];

    if (!res_role) {
      res
        .status(400)
        .send({ error: " Role are Note delete Because Role assigned to User" });
      return;
    }

    //Delete Roles
    const getQuery = Knex("roles").delete().where({ role_id }).toString();
    const result = await pool.query(getQuery);

    res.status(200).json({
      status: true,
      data: result.rows,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

module.exports = {
  postRoles,
  putRolebyid,
  getRolebyid,
  getRoles,
  StatusRole,
  getallRole,
  deleteRole,
}; //putRolebyid, getRolebyid, getRoles, putRoleactive, deleteRole };
