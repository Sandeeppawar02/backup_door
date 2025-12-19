const Joi = require("joi");
const Knex = require("../../db/knex");
const pool = require('../../db/dbConfig');


// 📦 Get All Subscription Plans
const getPlans = async (req, res) => {
  try {
    const getQuery = Knex.from(" plans")
        .select()
        .toString();
        const result = await pool.query(getQuery);
        
        const response = {
        message: "Plans Fetched successfully!",
        data: result.rows,
        status: true,
        };
        res.status(200).send(response);
  } catch (err) {
    res.status(500).send("Error loading success page");
  }
};

module.exports = {
  getPlans
};
