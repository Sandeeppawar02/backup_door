require("dotenv").config();
const jwt = require("jsonwebtoken");
const Knex = require('../../db/knex');
const pool = require('../../db/dbConfig');
const { JsonWebTokenError } = require("jsonwebtoken");

const accessSecret = process.env.accessSecret;

// Middleware for Authenticating User via Access Token
const auth = async (req, res, next) => {
  try {
    const access = req.header("x-access-token");

    if (!access) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    const decoded = jwt.verify(access, accessSecret);

    const query = Knex('users')
      .select()
      .where({ id: decoded.user_id })
      .limit(1)
      .toString();

    const userResult = await pool.query(query);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    req.id = decoded.user_id;
    req.user = userResult.rows[0];

    next();

  } catch (error) {
    console.error("Auth Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token has expired!" });
    } else if (error instanceof JsonWebTokenError) {
      return res.status(403).json({ error: "Invalid access token" });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = auth;
