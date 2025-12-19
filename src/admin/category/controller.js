const Joi = require("joi");
const Knex = require("../../../db/knex");
const pool = require('../../../db/dbConfig');

// category schema
const categorySchema = Joi.object({
  name: Joi.string().required().min(3),
});

// update category schema
const updatecategorySchema = Joi.object({
  name: Joi.string().required().min(3),
});
// Create a new category after validation and duplication check
const postAdminCategory = async (req, res) => {
  try {
    // Validate schema
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.message, status: false });
    }

    let { name, } = req.body;
    name = name.toLowerCase();

    // Check if Name  already exists
    const existingName = await Knex("categories").where({ name }).first();
    if (existingName) {
      return res.status(400).send({ error: "Name  already exists.", status: false });
    }

    // Insert new categories
    const insertQuery = await Knex("categories")
      .insert({
       name:name
      })
      .returning("*")
      .toString();

      const result = await pool.query(insertQuery);

    const response = {
      message: "categories Created  successful!",
      status: true,
      results :result.rows[0],
    };

    res.status(201).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};
// Update existing category by ID with validation
const putAdminCategory = async(req,res) =>{
  try {
    const id = req.params.id;
    // Validate schema
    const { error } = updatecategorySchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.message, status: false });
    }

    let { name, } = req.body;
    name = name.toLowerCase();

    const category = await Knex("categories").where({ id }).first();
    if (!category) {
    return res.status(404).send({ error: "Category not found.", status: false });
    }


    // Insert new categories
    const updateQuery = await Knex("categories")
      .update({
       name:name
      })
      .where({id})
      .returning("*")
      .toString();

      const result = await pool.query(updateQuery);

    const response = {
      message: "categories Updated  successful!",
      status: true,
      results :result.rows[0],
    };

    res.status(201).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

// Get all categories
const getAdminCategory = async (req, res) => {
  try {
    const getQuery = Knex("categories").select().returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get all Categories successful!",
      status: true,
      results: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

// Get a single category by ID
const getcategoryByid = async (req,res)=>{
  try {

    const id = req.params.id;
    const getQuery = Knex("categories").select().where({ id }).returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get Category successful!",
      status: true,
      results: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};
// Get a category by ID along with its subcategories
const getcategoryByIdwithSubcategory = async (req,res)=>{
  try {

    const id = req.params.id;
    const getQuery = Knex("categories as c ")
    .select(
      "c.name as cat_name",
      "sc.id as subcat_id",
      "sc.name as suncat_name"
    )
    .innerJoin('sub_categories as sc', 'sc.category_id', 'c.id' )
    .where({ "c.id": id }).returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get Category successful!",
      status: true,
      results: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

// Delete a category by ID
const deletecategoryByid = async (req, res)=>{
  try {

    const id = req.params.id;
    const getQuery = Knex("categories").del().where({ id }).returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Delete Category successful!",
      status: true,
      results: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }

};

module.exports = {postAdminCategory, putAdminCategory, getAdminCategory, getcategoryByid, deletecategoryByid, getcategoryByIdwithSubcategory};

