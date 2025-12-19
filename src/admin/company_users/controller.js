/* eslint-disable no-unused-vars */
const Knex = require("../../../db/knex");
const pool = require("../../../db/dbConfig");


// ✅ Fetch all companies with pagination
const getComapny = async (req, res) => {
  try {
    const limit = 15;
    const offset = req.query.page ? parseInt(req.query.page) - 1 : 0;
    let totalcount = 0;
    let pages = 0;

   // Count total companies
    const countQuery = Knex("company as c")
      .count("c.id")
      .returning("*")
      .toString();
    const res_count = await pool.query(countQuery);

    totalcount = res_count.rows[0]["count"];
    pages = Math.ceil(totalcount / limit);

    // Fetch paginated companies
    const getQuery = Knex("company")
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
// ✅ Fetch users by company ID with pagination
const getComapnyById = async (req,res)=>{
  try {
    const company_id = req.params.id;    
    const limit = 15;
    const offset = req.query.page ? parseInt(req.query.page) - 1 : 0;
    let totalcount = 0;
    let pages = 0;

    // Count users under the given company
    const countQuery = Knex("users")
      .count("users.id")
      .innerJoin("company", { "company.id": "users.company_id" })
      .where("users.company_id", company_id)
      .returning("*")
      .toString();
    const res_count = await pool.query(countQuery);

    totalcount = res_count.rows[0]["count"];
    pages = Math.ceil(totalcount / limit);

    // Fetch paginated users of the company
    const getQuery = Knex("users")
      .select()
      .innerJoin("company", { "company.id": "users.company_id" })
      .where("users.company_id", company_id)
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
}


const deleteUserById = async (req, res) => {
  try {
    const id = req.params.id;

    // First, delete related transactions
    const deleteTransactionsQuery = Knex("transactions").where({ user_id: id }).del();
    await pool.query(deleteTransactionsQuery.toString());

    // Then, delete the user
    const deleteQuery = Knex("users").where({ id }).del().toString();
    const result = await pool.query(deleteQuery);

    res.status(200).json({
      message: "User deleted successfully!",
      status: true,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};


module.exports = {
  getComapny,getComapnyById, deleteUserById
}; //putRolebyid, getRolebyid, getRoles, putRoleactive, deleteRole };
