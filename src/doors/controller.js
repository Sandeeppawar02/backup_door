const Joi = require("joi");
const Knex = require("../../db/knex");
const pool = require("../../db/dbConfig");

// Validation schema using Joi
const doorSchema = Joi.object({
  unit_size_type: Joi.string().required(),
  unit_function: Joi.string().required(),
  unit_configuration: Joi.string().required(),
  arch_unit: Joi.string().allow(null, ''),
  arch_door: Joi.string().allow(null, ''),
  jamb_width: Joi.string().allow(null, ''),
  jamb_depth: Joi.string().allow(null, ''),
  stile_width_thickness: Joi.string().allow(null, ''),
  over_10_door: Joi.boolean().required(),
  over_14_unit: Joi.boolean().required(),
  door_swing_from_ext: Joi.string().required(),
  roller_latches_prep: Joi.string().allow(null, ''),
  pull_handles: Joi.number().allow(null),
  hardware_prep_type: Joi.string().allow(null, ''),
  deadbolt_installation: Joi.string().allow(null, ''),
  threshold_type: Joi.string().allow(null, ''),
  threshold_height_ext: Joi.string().allow(null, ''),
  trim_exterior: Joi.boolean().required(),
  trim_interior: Joi.boolean().required(),
  bugscreens: Joi.number().allow(null),
  glass_temp: Joi.string().allow(null, ''),
  finish_selection: Joi.string().allow(null, ''),
  remodel: Joi.boolean().required(),
  out_of_town_install: Joi.boolean().required(),
  freight_in: Joi.boolean().required(),
  other_charge_1: Joi.number().allow(null),
  other_charge_2: Joi.number().allow(null),
  sqft: Joi.number().allow(null),
  unit_cost_psf: Joi.number().allow(null),
  estimated_cost: Joi.number().allow(null),
  price: Joi.number().allow(null),
  user_id: Joi.number().allow(null),
});

//  Insert a new basic door record using flat structure
const postDoor = async (req, res) => {
  try {
    // Validate request body
    const { error } = doorSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.message, status: false });
    }

    // Build insert query using Knex
    const insertQuery = Knex("doors")
      .insert(req.body)
      .returning("*")
      .toString();

    // Execute with pool
    const result = await pool.query(insertQuery);

    res.status(201).send({
      message: "Door record created successfully!",
      status: true,
      data: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};


// Insert a structured, relational door order record
const PostDoorOrder = async (req, res) => {
  try {
    const {
      door_name,
      unit_type_id,
      unit_function_id,
      configuration_id,
      arch_unit_id,
      arch_door_id,
      jamb_width_id,
      jamb_depth_id,
      stile_width,
      stile_thickness,
      over_10_door,
      over_14_unit,
      door_swing,
      roller_latch,
      pull_handle_id,
      hardware_prep_type_id,
      deadbolt_id,
      threshold_type_id,
      threshold_height,
      threshold_extension,
      trim_exterior_id,
      trim_interior,
      bugscreen_id,
      glass_temp_id,
      finish_selection_id,
      sound_seal,
      out_of_town,
      freight_in,
      other_charge,
      width,
      height,
      sqft,
      unit_cost,
      unit_cost_psf,
      est_cost,
      total_price
    } = req.body;

    const inserted = await Knex('door_orders').insert({
      door_name,
      unit_type_id,
      unit_function_id,
      configuration_id,
      arch_unit_id,
      arch_door_id,
      jamb_width_id,
      jamb_depth_id,
      stile_width,
      stile_thickness,
      over_10_door,
      over_14_unit,
      door_swing,
      roller_latch,
      pull_handle_id,
      hardware_prep_type_id,
      deadbolt_id,
      threshold_type_id,
      threshold_height,
      threshold_extension,
      trim_exterior_id,
      trim_interior,
      bugscreen_id,
      glass_temp_id,
      finish_selection_id,
      sound_seal,
      out_of_town,
      freight_in,
      other_charge,
      width,
      height,
      sqft,
      unit_cost,
      unit_cost_psf,
      est_cost,
      total_price
    });

    res.status(200).json({ success: true, insertedId: inserted[0] });
  } catch (error) {
    console.error('Insert failed:', error);
    res.status(500).json({ success: false, message: 'Insert failed', error });
  }
};

module.exports = { postDoor, PostDoorOrder };
