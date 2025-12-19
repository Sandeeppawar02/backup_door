require("dotenv").config();
const pool = require("../../db/dbConfig.js");
const Knex = require("../../db/knex");
const jwt = require("jsonwebtoken");

const accessSecret = process.env.accessSecret;


// Middleware to Verify JWT and Role-Based Permissions
const checkPermissions = (module, permission) => {
  return async (req, res, next) => {
    try {
      console.log("checkPermissions.........!!!")
      let authToken = req.header("Authorization");
      if (!authToken) {
        throw new Error("Token not provided");
      }

      authToken = authToken.replace("Bearer ", "");
      const decoded = jwt.verify(authToken, accessSecret);

      const getQuery = Knex("users")
        .select(
          "users.*",
          "users.id as id",
          "roles.*",
          "users.first_name as user_name"
        )
        .innerJoin("roles", "roles.role_id", "users.role_id")
        .where("users.id", decoded.user_id)
        .toString();

      console.log("Executing SQL:", getQuery); // helpful debug

      const result = await pool.query(getQuery);

      const user = result.rows[0];

      const readPass = ["READ", "UPDATE", "DELETE", "WRITE"];

      if (
        permission === "READ" &&
        user[module]?.some((r) => readPass.includes(r))
      ) {
        req.decoded = decoded;
        req.token = authToken;
        req.user = user;
        return next();
      }

      if (!user[module]?.includes(permission)) {
        throw new Error("Permission denied");
      }

      req.decoded = decoded;
      req.token = authToken;
      req.user = user;
      next();
    } catch (err) {
      console.error("JWT error:", err.message);
      res.status(401).json({
        message: err.message || "INTERNAL SERVER ERROR",
      });
    }
  };
};


module.exports = { checkPermissions };
