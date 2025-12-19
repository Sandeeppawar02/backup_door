const Joi = require("joi");
const Knex = require("../../../db/knex");
const pool = require('../../../db/dbConfig');

// category schema
const SubcategorySchema = Joi.object({
  name: Joi.string().required().min(3),
  category_id: Joi.number().required()
});

// update category schema
const UpdateSubcategorySchema = Joi.object({
   name: Joi.string().required().min(3),
   category_id: Joi.number().required()
});

const postAdminSubcategory = async (req, res) => {
  try {
    // Validate schema
    const { error } = SubcategorySchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.message, status: false });
    }

    let { name, category_id } = req.body;
    name = name.toLowerCase();

    // Check if Name  already exists
    const existingName = await Knex("sub_categories").where({ name }).first();
    if (existingName) {
      return res.status(400).send({ error: "Name  already exists.", status: false });
    }

    // Insert new categories
    const insertQuery = await Knex("sub_categories")
      .insert({
       name:name,
       category_id:category_id
       
      })
      .returning("*")
      .toString();

      const result = await pool.query(insertQuery);

    const response = {
      message: "Subcategories Created  successful!",
      status: true,
      results :result.rows[0],
    };

    res.status(201).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

const putAdminSubcategory = async(req,res) =>{
  try {
    const id = req.params.id;
    // Validate schema
    const { error } = UpdateSubcategorySchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.message, status: false });
    }

    let { name, category_id } = req.body;
    name = name.toLowerCase();

    const category = await Knex("sub_categories").where({ id }).first();
    if (!category) {
    return res.status(404).send({ error: "Category not found.", status: false });
    }


    // Insert new categories
    const updateQuery = await Knex("sub_categories")
      .update({
       name:name,
       category_id:category_id
      })
      .where({id})
      .returning("*")
      .toString();

      const result = await pool.query(updateQuery);


    const response = {
      message: "Subcategories Updated  successful!",
      status: true,
      results :result.rows[0],
    };

    res.status(201).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

const getAdminSubccategory = async (req,res)=>{
  try {
    const getQuery = Knex("sub_categories as sc")
    .select(
      "sc.*",
      "c.name as category_name")
    .innerJoin("categories as c", "c.id", "sc.category_id")
    .returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get all Sub_Categories successful!",
      status: true,
      results: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

const getSubcategoryByid = async (req,res)=>{
  try {

    const id = req.params.id;
    const getQuery = Knex("sub_categories as sc")
    .select(
        "sc.*",
        "c.name as category_name")
    .innerJoin("categories as c", "c.id", "sc.category_id")
    .where({ "sc.id": id })
    .returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get SubCategory successful!",
      status: true,
      results: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

const deleteSubcategoryByid = async (req, res)=>{
  try {

    const id = req.params.id;
    const getQuery = Knex("sub_categories").del().where({ id }).returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Delete SubCategory successful!",
      status: true,
      results: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }

};

module.exports = {  postAdminSubcategory,  putAdminSubcategory, getAdminSubccategory,  getSubcategoryByid, deleteSubcategoryByid };
 
