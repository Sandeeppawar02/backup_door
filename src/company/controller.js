const Joi = require("joi");
const Knex = require("../../db/knex"); // your Knex connection
const pool = require('../../db/dbConfig');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
} = require("../utils/tokens");

// Register schema
const registerSchema = Joi.object({
  company_name: Joi.string().required().min(3), // You had min(20) — adjust if needed
  user_count: Joi.number().required(),
  description: Joi.string().required(),
  // device_token: Joi.string().optional()
});


// Update schema
const updateSchema = Joi.object({
  company_name: Joi.string().required().min(3), // You had min(20) — adjust if needed
  user_count: Joi.number().required(),
  description: Joi.string().required(),
  category_id: Joi.array().optional(),
  sub_category_id: Joi.array().optional(),
});

//  Controller to register a new company and return access & refresh tokens
const postCompanyRegister = async (req, res) => {
  try {
    // Validate schema
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.message, status: false });
    }

    let { company_name, user_count, description } = req.body;
    company_name = company_name.toLowerCase();

    // Insert into company table directly using Knex
    const [company] = await Knex("company")
      .insert({
        company_name,
        user_count,
        description,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");

    // Create payload for tokens
    const userPayload = {
      user_id: company.id,
      company_name: company.company_name,
    };

    // Generate tokens
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    console.log("Access Token Generated:", accessToken);
    console.log("Refresh Token Generated:", refreshToken);

    // Store refresh token
    // const [tokenInfo] = await storeRefreshToken(company.id, refreshToken);

    const response = {
      message: "Registration successful!",
      data: {
        id: company.id,
        company_name: company.company_name,
        user_count: company.user_count,
        description: company.description,
      },
      status: true,
      access: { token: accessToken, issued_at: new Date() },
      refresh: { token: refreshToken, issued_at: new Date() },
    };

    res.status(201).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

const updateCompany = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate input
    const { error } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.message, status: false });
    }

    let {
      company_name,
      user_count,
      description,
      category_id,
      sub_category_id,
    } = req.body;

    // Ensure user_count is a number
    user_count = Number(user_count);

    // Check if company exists
    const existingCompany = await Knex("company").where({ id }).first();
    if (!existingCompany) {
      return res.status(400).send({ error: "Company does not exist.", status: false });
    }

    // Update the company
    const [updatedCompany] = await Knex("company")
      .update({
        company_name,
        user_count,
        description,
        category_id,
        sub_category_id,
        updated_at: new Date(), // only update updated_at
      })
      .where({ id })
      .returning("*");

    res.status(200).send({
      message: "Company updated successfully!",
      data: updatedCompany,
      status: true,
    });

  } catch (err) {
    console.error("Error updating company:", err);
    res.status(500).send({ error: err.message, status: false });
  }
};


const getCompany = async (req, res) => {
  try {
    const getQuery = Knex("company")
      .select()
      .returning('*').toString();
    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get Company successful!",
      status: true,
      results: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
}

const deleteCompanyById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the company exists
    const company = await Knex("company").where({ id }).first();
    if (!company) {
      return res.status(404).send({ status: false, error: "Company not found." });
    }

    // Get all users related to the company
    const users = await Knex("users").where({ company_id: id });

    // Delete related transactions for each user
    for (let user of users) {
      const deleteTransactionsQuery = Knex("transactions").where({ user_id: user.id }).del();
      await pool.query(deleteTransactionsQuery.toString());

      // Delete the user
      const deleteUserQuery = Knex("users").where({ id: user.id }).del().toString();
      await pool.query(deleteUserQuery);
    }

    // Delete the company after users are deleted
    await Knex("company").where({ id }).del();

    return res.status(200).send({
      status: true,
      message: "Company and all related users deleted permanently."
    });

  } catch (err) {
    console.error("Error deleting company:", err);
    return res.status(500).send({ status: false, error: err.message });
  }
};


const getCompanyById = async (req,res)=>{
   try {
    const id = req.params.id;

    const company = await Knex("company").where({ id }).first();

    if (!company) {
      return res.status(404).send({ status: false, error: "Company not found." });
    }

    const getQuery = Knex("company")
      .select()
      .where({ id })
      .returning('*').toString();
    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get Company successful!",
      status: true,
      results: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  } 
}


const updateCompanyActivestatus = async(req,res)=>{
try {
    const id = req.params.id;

    // Check if company exists
    const existingCompany = await Knex("company").where({ id }).first();
    if (!existingCompany) {
      return res.status(400).send({ error: "Company does not exist.", status: false });
    }

    const status = existingCompany.is_active;
    let users, updatedCompany = {};


     if(status === true){
    // Update the company
     [updatedCompany] = await Knex("company")
      .update({
       is_active:false
      })
      .where({ id })
      .returning("*");

    // Update the company
    [users] = await Knex("users")
      .update({
       is_active:false
      })
      .where("company_id", id)
      .returning("*");

    } else if(status === false){
        // Update the company
     [updatedCompany] = await Knex("company")
      .update({
       is_active:true
      })
      .where({ id })
      .returning("*");

    // Update the company
    [users] = await Knex("users")
      .update({
       is_active:true
      })
      .where("company_id", id)
      .returning("*");
    } 

    res.status(200).send({
      message: "Company updated successfully!",
      data: updatedCompany,
      status: true,
    });

  } catch (err) {
    console.error("Error updating company:", err);
    res.status(500).send({ error: err.message, status: false });
  }
}


const updateUserActivestatus = async(req,res)=>{
try {
    const id = req.params.id;
    // Check if Users exists
    const existingUsers = await Knex("users").where({ id }).first();
    if (!existingUsers) {
      return res.status(400).send({ error: "Users does not exist.", status: false });
    }

    const status = existingUsers.is_active;
    let users = {};

    if(status === true){
     [users] = await Knex("users")
      .update({
       is_active:false
      })
      .where({id})
      .returning("*");

    } else if(status === false){
    // Update the Users
      [users] = await Knex("users")
      .update({
       is_active:true
      })
      .where({id})
      .returning("*");
    } 

    res.status(200).send({
      message: "Users updated successfully!",
      data: users,
      status: true,
    });

  } catch (err) {
    console.error("Error updating Users:", err);
    res.status(500).send({ error: err.message, status: false });
  }
}

module.exports = { postCompanyRegister, getCompany, updateCompany, deleteCompanyById , getCompanyById, updateCompanyActivestatus, updateUserActivestatus};
