const Joi = require("joi");
const Knex = require("../../db/knex");
const pool = require('../../db/dbConfig');
// Fetch list of door swing types (dropdown: value-label pair)
const getDoorSwingTypes = async (req, res) => {
  try {
    const getQuery = Knex.from("door_swing_types")
      .select("id as value", "name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }
};
// Fetch hardware prep types for selection
const getHardwarePrepTypes  = async (req,res)=>{
  try {
    const getQuery = Knex.from("hardware_prep_types")
      .select("id as value", "name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }
};
// Fetch threshold types for form options
const getThresholdTypes = async (req, res)=>{
  try {
    const getQuery = Knex.from("threshold_types")
      .select("id as value", "name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }
};
// Fetch unit configurations (standard, custom etc.)
const getUnitConfigurations = async (req,res)=>{
  try {
    const getQuery = Knex.from("unit_configurations")
      .select("id as value", "name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }
};
// Fetch unit functions (e.g., standard, emergency)
const getUnitFunctions = async (req,res)=>{
  try {
    const getQuery = Knex.from("unit_functions")
      .select("id as value", "name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  } 
};
// Fetch unit size types (e.g., 3068, 4070)
const getUnitSizeTypes = async (req,res)=>{
  try {
    const getQuery = Knex.from("unit_size_types")
      .select("id as value", "name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }  
};
// Fetch jamb depth (interior to exterior values)
const getJambDepthIntToExt = async(req,res)=>{
  try {
    const getQuery = Knex.from("jamb_depth_int_to_ext")
      .select("id as value", "depth_value as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }  
};

// Fetch stile width/thickness options for door
const getStileWidthThicknessOfDoor = async(req, res)=>{
  try {
    const getQuery = Knex.from("stile_width_thickness_of_door")
      .select("id as value", "size as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }  
};
// Fetch threshold height extension options
const getThresholdHeightExtension = async (req,res)=>{
  try {
    const getQuery = Knex.from("threshold_height_extension")
      .select("id as value", "value as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }  
}
// Fetch arch unit types (e.g., elliptical, round)
const getArchUnitTypes = async(req,res)=>{
  try {
    const getQuery = Knex.from("arch_unit_types")
      .select("id as value", "type_name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }   
}

// Fetch jamb width options
const getJambWidth = async(req,res)=>{
  try {
    const getQuery = Knex.from("jamb_width")
      .select("id as value", "width_label as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }   
};

// Fetch roller latches prep options
const getRollerLatchesPrep = async (req,res)=>{
  try {
    const getQuery = Knex.from("roller_latches_prep")
      .select("id as value", "name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }    
};

// Fetch pull handle types
const getPullHandles = async (req,res)=>{
  try {
    const getQuery = Knex.from("pull_handles")
      .select("id as value", "type_code as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }  
};

// Fetch glass temperature IG options
const getGlassTempIg = async (req, res)=>{
  try {
    const getQuery = Knex.from("glass_temp_ig")
      .select("id as value", "option_name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }   
};

// Fetch finish selection codes
const getFinishSelection = async (req,res)=>{
  try {
  const getQuery = Knex.from("finish_selection")
      .select("id as value", "finish_code as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message, status: false });
  }     
};

// Fetch deadbolt installation type options
const getDeadboltInstallationTypes = async (req, res) => {
  try {
    const getQuery = Knex.from("deadbolt_installation_types")
      .select("id as value", "name as label")
      .orderBy("id")
      .toString();
    const result = await pool.query(getQuery);
    const response = {
      message: "Fetched successfully!",
      data: result.rows,
      status: true,
    };
    res.status(200).send(response);
  } catch (e) {
    console.log("Error in getDeadboltInstallationTypes:", e);
    res.status(500).send({ error: e.message, status: false });
  }
};

module.exports = { getDoorSwingTypes, getHardwarePrepTypes, getThresholdTypes, getUnitConfigurations, getUnitFunctions, getUnitSizeTypes, getJambDepthIntToExt, getStileWidthThicknessOfDoor, getThresholdHeightExtension, getArchUnitTypes, getJambWidth, getRollerLatchesPrep, getPullHandles, getGlassTempIg, getFinishSelection, getDeadboltInstallationTypes };
 
