require('dotenv').config();
const Joi = require("joi");
const Knex = require("../../db/knex");

const moment = require("moment");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');




// // Multer setup
// const storage = multer.memoryStorage();
// const upload = multer({ storage });


// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: 10MB limit
});




// AWS SDK v3 Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Upload folder
const localUploadPath = path.resolve(__dirname, '../../uploads'); //  fixed path
if (!fs.existsSync(localUploadPath)) {
  fs.mkdirSync(localUploadPath, { recursive: true });
}


// Joi schema with boolean support for 1/0
const doorSchema = Joi.object({
  user_id: Joi.number().required(),
  unit_size_type: Joi.number().allow(null),
  unit_function: Joi.number().allow(null),
  unit_configuration: Joi.number().allow(null),
  arch_unit: Joi.number().allow(null),
  arch_unit_y_n: Joi.string().allow(null, ''),
  arch_door: Joi.number().allow(null),
  arch_door_y_n: Joi.string().allow(null, ''),
  jamb_width: Joi.number().allow(null, ''),
  jamb_width_unit_cost_psf: Joi.number().allow(null),
  jamb_depth: Joi.number().allow(null, ''),
  jamb_depth_unit_cost_psf: Joi.number().allow(null),
  stile_width_thickness: Joi.number().allow(null),
  stile_width_thickness_unit_cost_psf: Joi.number().allow(null),

  over_10_door: Joi.boolean().truthy(1).falsy(0).allow(null),
  over_10_door_unit_cost_psf: Joi.number().allow(null),
  over_14_unit: Joi.boolean().truthy(1).falsy(0).allow(null),
  over_14_unit_unit_cost_psf: Joi.number().allow(null),

  door_swing_from_ext: Joi.number().allow(null),
  door_swing_from_ext_unit_cost_psf: Joi.number().allow(null),

  roller_latches_prep: Joi.number().allow(null),
  roller_latches_prep_y_n: Joi.string().allow(null, ''),
  pull_handles: Joi.number().allow(null),
  pull_handles_size: Joi.number().allow(null),

  hardware_prep_type: Joi.number().allow(null, ''),
  hardware_prep_type_unit_cost_psf: Joi.number().allow(null),

  deadbolt_installation: Joi.number().allow(null),
  deadbolt_installation_size: Joi.number().allow(null, ''),

  threshold_type: Joi.number().allow(null),
  threshold_type_unit_cost_psf: Joi.number().allow(null),
  threshold_ht: Joi.number().allow(null),

  trim_exterior: Joi.boolean().truthy(1).falsy(0).allow(null),
  trim_interior: Joi.boolean().truthy(1).falsy(0).allow(null),

  bugscreens: Joi.number().allow(null),
  bugscreens_unit_cost_psf: Joi.number().allow(null),
  glass_temp: Joi.number().allow(null),
  finish_selection: Joi.number().allow(null),

  remodel: Joi.boolean().truthy(1).falsy(0).allow(null),
  remodel_unit_cost_psf: Joi.number().allow(null),
  out_of_town_install: Joi.boolean().truthy(1).falsy(0).allow(null),
  out_of_town_install_unit_cost_psf: Joi.number().allow(null),
  freight_in: Joi.boolean().truthy(1).falsy(0).allow(null),
  freight_in_unit_cost_psf: Joi.number().allow(null),
  other_charge_2: Joi.number().allow(null),
  other_charge_2_unit_cost_psf: Joi.number().allow(null),

  // Dimension & cost fields (repeated pattern)
  unit_size_types_width_inches: Joi.number().allow(null),
  unit_size_types_height_inches: Joi.number().allow(null),
  unit_size_types_sqft_lft: Joi.number().allow(null),
  unit_size_types_unit_cost_psf: Joi.number().allow(null),
  unit_size_types_estimated_cost: Joi.number().allow(null),
  unit_size_types_price: Joi.number().allow(null),

  unit_functions_width_inches: Joi.number().allow(null),
  unit_functions_height_inches: Joi.number().allow(null),
  unit_functions_sqft_lft: Joi.number().allow(null),
  unit_functions_unit_cost_psf: Joi.number().allow(null),
  unit_functions_estimated_cost: Joi.number().allow(null),
  unit_functions_price: Joi.number().allow(null),

  arch_unit_types_width_inches: Joi.number().allow(null),
  arch_unit_types_height_inches: Joi.number().allow(null),
  arch_unit_types_sqft_lft: Joi.number().allow(null),
  arch_unit_types_unit_cost_psf: Joi.number().allow(null),
  arch_unit_estimated_cost: Joi.number().allow(null),
  arch_unit_price: Joi.number().allow(null),

  arch_door_types_width_inches: Joi.number().allow(null),
  arch_door_types_height_inches: Joi.number().allow(null),
  arch_door_types_sqft_lft: Joi.number().allow(null),
  arch_door_types_unit_cost_psf: Joi.number().allow(null),
  arch_door_estimated_cost: Joi.number().allow(null),
  arch_door_price: Joi.number().allow(null),

  roller_latches_prep_width_inches: Joi.number().allow(null),
  roller_latches_prep_height_inches: Joi.number().allow(null),
  roller_latches_prep_sqft_lft: Joi.number().allow(null),
  roller_latches_prep_unit_cost_psf: Joi.number().allow(null),
  roller_latches_prep_estimated_cost: Joi.number().allow(null),
  roller_latches_prep_price: Joi.number().allow(null),

  pull_handles_width_inches: Joi.number().allow(null),
  pull_handles_height_inches: Joi.number().allow(null),
  pull_handles_sqft_lft: Joi.number().allow(null),
  pull_handles_unit_cost_psf: Joi.number().allow(null),
  pull_handles_estimated_cost: Joi.number().allow(null),
  pull_handles_price: Joi.number().allow(null),

  deadbolt_installation_types_width_inches: Joi.number().allow(null),
  deadbolt_installation_types_height_inches: Joi.number().allow(null),
  deadbolt_installation_types_sqft_lft: Joi.number().allow(null),
  deadbolt_installation_types_unit_cost_psf: Joi.number().allow(null),
  deadbolt_installation_estimated_cost: Joi.number().allow(null),
  deadbolt_installation_price: Joi.number().allow(null),

  threshold_ht_width_inches: Joi.number().allow(null),
  threshold_ht_height_inches: Joi.number().allow(null),
  threshold_ht_sqft_lft: Joi.number().allow(null),
  threshold_ht_unit_cost_psf: Joi.number().allow(null),
  threshold_ht_estimated_cost: Joi.number().allow(null),
  threshold_ht_price: Joi.number().allow(null),

  trim_exterior_width_inches: Joi.number().allow(null),
  trim_exterior_height_inches: Joi.number().allow(null),
  trim_exterior_sqft_lft: Joi.number().allow(null),
  trim_exterior_unit_cost_psf: Joi.number().allow(null),
  trim_exterior_estimated_cost: Joi.number().allow(null),
  trim_exterior_price: Joi.number().allow(null),

  trim_interior_width_inches: Joi.number().allow(null),
  trim_interior_height_inches: Joi.number().allow(null),
  trim_interior_sqft_lft: Joi.number().allow(null),
  trim_interior_unit_cost_psf: Joi.number().allow(null),
  trim_interior_estimated_cost: Joi.number().allow(null),
  trim_interior_price: Joi.number().allow(null),

  glass_temp_ig_width_inches: Joi.number().allow(null),
  glass_temp_ig_height_inches: Joi.number().allow(null),
  glass_temp_ig_sqft_lft: Joi.number().allow(null),
  glass_temp_ig_unit_cost_psf: Joi.number().allow(null),
  glass_temp_ig_estimated_cost: Joi.number().allow(null),
  glass_temp_ig_price: Joi.number().allow(null),

  total_estimated_cost: Joi.number().allow(null),
  total_price: Joi.number().allow(null),


  over_10_door_estimated_cost: Joi.number().allow(null),
  over_10_door_price: Joi.number().allow(null),


  over_14_unit_estimated_cost: Joi.number().allow(null),
  over_14_unit_price: Joi.number().allow(null),


  bugscreens_estimated_cost: Joi.number().allow(null),
  bugscreens_price: Joi.number().allow(null),

  remodel_estimated_cost: Joi.number().allow(null),
  remodel_price: Joi.number().allow(null),


  door_name :Joi.string().required(),
  interior_color: Joi.string().allow(null),
  exterior_color: Joi.string().allow(null),
  arch:Joi.number().allow(null),
  grill: Joi.string().allow(null),
  grill_color: Joi.string().allow(null),
  handle:Joi.number().allow(null),
  handle_color:Joi.string().allow(null),

  notes:Joi.string().allow(null),
  glft_obj_id:Joi.number().allow(null)


}).unknown(false); // Prevent extra fields

// utils/sanitizePayload.js
const numericFields = [
  "jamb_width_unit_cost_psf", "jamb_depth_unit_cost_psf",
  "stile_width_thickness_unit_cost_psf", "over_10_door_unit_cost_psf",
  "over_14_unit_unit_cost_psf", "door_swing_from_ext_unit_cost_psf",
  "hardware_prep_type_unit_cost_psf", "threshold_type_unit_cost_psf",
  "bugscreens", "bugscreens_unit_cost_psf", "remodel_unit_cost_psf",
  "out_of_town_install_unit_cost_psf", "freight_in_unit_cost_psf",
  "other_charge_2", "other_charge_2_unit_cost_psf",
  "unit_size_types_width_inches", "unit_size_types_height_inches",
  "unit_size_types_sqft_lft", "unit_size_types_unit_cost_psf",
  "unit_size_types_estimated_cost", "unit_size_types_price",
  "unit_functions_width_inches", "unit_functions_height_inches",
  "unit_functions_sqft_lft", "unit_functions_unit_cost_psf",
  "unit_functions_estimated_cost", "unit_functions_price",
  "arch_unit_types_width_inches", "arch_unit_types_height_inches",
  "arch_unit_types_sqft_lft", "arch_unit_types_unit_cost_psf",
  "arch_unit_estimated_cost", "arch_unit_price",
  "arch_door_types_width_inches", "arch_door_types_height_inches",
  "arch_door_types_sqft_lft", "arch_door_types_unit_cost_psf",
  "arch_door_estimated_cost", "arch_door_price",
  "roller_latches_prep_width_inches", "roller_latches_prep_height_inches",
  "roller_latches_prep_sqft_lft", "roller_latches_prep_unit_cost_psf",
  "roller_latches_prep_estimated_cost", "roller_latches_prep_price",
  "pull_handles_width_inches", "pull_handles_height_inches",
  "pull_handles_sqft_lft", "pull_handles_unit_cost_psf",
  "pull_handles_estimated_cost", "pull_handles_price",
  "deadbolt_installation_types_width_inches", "deadbolt_installation_types_height_inches",
  "deadbolt_installation_types_sqft_lft", "deadbolt_installation_types_unit_cost_psf",
  "deadbolt_installation_estimated_cost", "deadbolt_installation_price",
  "threshold_ht_width_inches", "threshold_ht_height_inches",
  "threshold_ht_sqft_lft", "threshold_ht_unit_cost_psf",
  "threshold_ht_estimated_cost", "threshold_ht_price",
  "trim_exterior_width_inches", "trim_exterior_height_inches",
  "trim_exterior_sqft_lft", "trim_exterior_unit_cost_psf",
  "trim_exterior_estimated_cost", "trim_exterior_price",
  "trim_interior_width_inches", "trim_interior_height_inches",
  "trim_interior_sqft_lft", "trim_interior_unit_cost_psf",
  "trim_interior_estimated_cost", "trim_interior_price",
  "glass_temp_ig_width_inches", "glass_temp_ig_height_inches",
  "glass_temp_ig_sqft_lft", "glass_temp_ig_unit_cost_psf",
  "glass_temp_ig_estimated_cost", "glass_temp_ig_price",
  "total_estimated_cost", "total_estimated_cost",
  "total_price", "total_price",
  "arch","arch",
  "handle", "handle",
  "glft_obj_id", "glft_obj_id"


  // "door_name" ,"door_name" ,
  // "interior_color","interior_color",
  // "exterior_color", "exterior_color",
  // "grill", "grill",
  //  // "grill_color","grill_color",
  // "handle_color", "handle_color"

];
// ✅ Utility to sanitize numeric and boolean fields in the payload
function sanitizeDoorPayload(payload) {
  const sanitized = { ...payload };

  numericFields.forEach((field) => {
    let value = sanitized[field];

    if (value === undefined || value === null || value === "") {
      sanitized[field] = 0;
    } else if (typeof value === "boolean") {
      sanitized[field] = value ? 1 : 0;
    } else if (typeof value === "string") {
      if (value.toLowerCase() === "true") sanitized[field] = 1;
      else if (value.toLowerCase() === "false") sanitized[field] = 0;
      else sanitized[field] = parseFloat(value) || 0;
    } else {
      sanitized[field] = Number(value) || 0;
    }
  });

  return sanitized;
}
// ✅ Utility to normalize key names with special characters like "y/n"
function normalizePayloadKeys(payload) {
  const normalized = { ...payload };

  const keyMap = {
    "arch_door_y/n": "arch_door_y_n",
    "arch_unit_y/n": "arch_unit_y_n",
    "roller_latches_prep_y/n": "roller_latches_prep_y_n"
  };

  for (const [badKey, goodKey] of Object.entries(keyMap)) {
    if (normalized.hasOwnProperty(badKey)) {
      normalized[goodKey] = normalized[badKey];
      delete normalized[badKey];
    }
  }

  return normalized;
}




const postDoorCalculation = async (req, res) => {
  try {
    // console.log("Request body:", req.body);  // Log request body
    // console.log("Uploaded files:", req.files);  // Log uploaded files

    const files = req.files || {};
    const { image, background_image } = files; // Separate the images
    
    // Log files for debugging
    console.log(req.files);

    // Parse "info" field from form-data (should be a stringified JSON object)
    const info = JSON.parse(req.body.info || "{}");

    let {
      door_name,
      interior_color,
      exterior_color,
      grill_color,
      handle_color,
      notes,
      glft_obj_id,
    } = info;

    // Normalize text values
    const normalize = (s) => s?.toString().toLowerCase();
    door_name = normalize(door_name);
    interior_color = normalize(interior_color);
    exterior_color = normalize(exterior_color);
    grill_color = normalize(grill_color);
    handle_color = normalize(handle_color);
    notes = normalize(notes);

    // Normalize keys (e.g., y/n keys)
    const normalizedData = normalizePayloadKeys(info);

    // Sanitize numeric fields
    const sanitizedData = sanitizeDoorPayload(normalizedData);

    // Handle image upload to S3
    const s3BaseUrl =
      process.env.CLOUDFRONT_URL ||
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

    let imageUrls = [];
    let backgroundImageUrl = null;

    // Handle "image" upload
    if (Array.isArray(image)) {
      for (const file of image) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const localPath = path.join(localUploadPath, fileName);

        // Save image locally
        fs.writeFileSync(localPath, file.buffer);

        // Upload to S3
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `customer_info/${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        imageUrls.push(`${s3BaseUrl}/customer_info/${fileName}`);
      }
    }

    // Handle "background_image" upload
    if (Array.isArray(background_image) && background_image.length > 0) {
      const file = background_image[0];
      const fileName = `${Date.now()}_${file.originalname}`;
      const localPath = path.join(localUploadPath, fileName);

      // Save background image locally
      fs.writeFileSync(localPath, file.buffer);

      // Upload to S3
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `background_images/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));
      backgroundImageUrl = `${s3BaseUrl}/background_images/${fileName}`;
    }

    // Prepare data for insertion into database
    const insertPayload = {
      ...sanitizedData,
      img_url: imageUrls, // Store the image URLs
      background_image: backgroundImageUrl, // Store the background image URL
      door_name,
      interior_color,
      exterior_color,
      grill_color,
      handle_color,
      notes,
      glft_obj_id,
    };

    const inserted = await Knex("doors").insert(insertPayload).returning("*");

    // Response
    res.status(201).json({
      status: true,
      message: "Door inserted successfully",
      data: inserted[0],
    });

  } catch (err) {
    console.error("Error inserting door:", err);
    res.status(500).json({
      status: false,
      message: "Failed to insert door",
      error: err.message,
    });
  }
};


const putDoorCalculation = async (req, res) => {
  try {
    const id = req.params.id;
    const files = req.files || {};
    const { image, background_image } = files; // Separate the images

    // Parse "info" field from form-data (should be a stringified JSON object)
    const info = JSON.parse(req.body.info || "{}");

    let {
      door_name,
      interior_color,
      exterior_color,
      grill_color,
      handle_color,
      notes,
      glft_obj_id,
    } = info;

    // Normalize text values
    const normalize = (s) => s?.toString().toLowerCase();
    door_name = normalize(door_name);
    interior_color = normalize(interior_color);
    exterior_color = normalize(exterior_color);
    grill_color = normalize(grill_color);
    handle_color = normalize(handle_color);
    notes = normalize(notes);

    // Normalize keys (e.g., y/n keys)
    const normalizedData = normalizePayloadKeys(info);

    // Sanitize numeric fields
    const sanitizedData = sanitizeDoorPayload(normalizedData);

    
    // STEP 3: Check if door exists
    const existingDoor = await Knex("doors").where({ id }).first();
    if (!existingDoor) {
      return res.status(404).json({ status: false, error: "Door does not exist." });
    }


    // Handle image upload to S3
    const s3BaseUrl =
      process.env.CLOUDFRONT_URL ||
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

    let imageUrls = [];
    let backgroundImageUrl = null;

    // Handle "image" upload
    if (Array.isArray(image)) {
      for (const file of image) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const localPath = path.join(localUploadPath, fileName);

        // Save image locally
        fs.writeFileSync(localPath, file.buffer);

        // Upload to S3
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `customer_info/${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        imageUrls.push(`${s3BaseUrl}/customer_info/${fileName}`);
      }
    }

    // Handle "background_image" upload
    if (Array.isArray(background_image) && background_image.length > 0) {
      const file = background_image[0];
      const fileName = `${Date.now()}_${file.originalname}`;
      const localPath = path.join(localUploadPath, fileName);

      // Save background image locally
      fs.writeFileSync(localPath, file.buffer);

      // Upload to S3
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `background_images/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));
      backgroundImageUrl = `${s3BaseUrl}/background_images/${fileName}`;
    }

    // Prepare data for insertion into database
    const insertPayload = {
      ...sanitizedData,
      img_url: imageUrls, // Store the image URLs
      background_image: backgroundImageUrl, // Store the background image URL
      door_name,
      interior_color,
      exterior_color,
      grill_color,
      handle_color,
      notes,
      glft_obj_id,
    };

    const inserted = await Knex("doors").update(insertPayload).where({ id }).returning("*");

    // Response
    res.status(201).json({
      status: true,
      message: "Door inserted successfully",
      data: inserted[0],
    });

  } catch (err) {
    console.error("Error inserting door:", err);
    res.status(500).json({
      status: false,
      message: "Failed to insert door",
      error: err.message,
    });
  }
};



// const putDoorCalculation = async (req, res) => {
//    try {
//     const id = req.params.id;
//     const files = req.files || {};
//     const { image } = files;

//     // Parse "info" field from form-data (should be a stringified JSON object)
//     const info = JSON.parse(req.body.info || "{}");
//     // STEP 2: Normalize keys (e.g., y/n keys)
//     const normalizedData = normalizePayloadKeys(info);

//     // STEP 3: Sanitize numeric fields
//     const sanitizedData = sanitizeDoorPayload(normalizedData);

//     // STEP 3: Check if door exists
//     const existingDoor = await Knex("doors").where({ id }).first();
//     if (!existingDoor) {
//       return res.status(404).json({ status: false, error: "Door does not exist." });
//     }


//     // STEP 4: Handle image upload
//     const s3BaseUrl = process.env.CLOUDFRONT_URL || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
//     let imageUrls = [];

//     if (Array.isArray(image)) {
//       for (const file of image) {
//         const fileName = `${Date.now()}_${file.originalname}`;
//         const localPath = path.join(localUploadPath, fileName);

//         // Save image locally
//         fs.writeFileSync(localPath, file.buffer);

//         // Upload to S3
//         const uploadParams = {
//           Bucket: process.env.AWS_BUCKET_NAME,
//           Key: `customer_info/${fileName}`,
//           Body: file.buffer,
//           ContentType: file.mimetype,
//         };

//         await s3.send(new PutObjectCommand(uploadParams));
//         imageUrls.push(`${s3BaseUrl}/customer_info/${fileName}`);
//       }
//     }

//     // STEP 5: Insert into database
//     const insertPayload = {
//       ...sanitizedData,
//      img_url: imageUrls
//     };

//     const inserted = await Knex("doors").update(insertPayload).where({ id }).returning("*");

//     // STEP 6: Response
//     res.status(201).json({
//       status: true,
//       message: "Door inserted successfully",
//       data: inserted[0],
//     });

//   } catch (err) {
//     console.error("Error inserting door:", err);
//     res.status(500).json({
//       status: false,
//       message: "Failed to insert door",
//       error: err.message,
//     });
//   }
// };

const getAllDoors = async (req, res) => {
  try {
    const doors = await Knex("doors")
      .select(
        "doors.*",
        "unit_size_types.name as unit_size_type",
        "unit_functions.name as unit_function",
        "unit_configurations.name as unit_configuration",
        "arch_unit_types.type_name as arch_unit",
        "arch_door_types.type_name as arch_door",
        "door_swing_types.name as door_swing_from_ext",
        "roller_latches_prep.name as roller_latches_prep",
        "pull_handles.type_code as pull_handles",
        "deadbolt_installation_types.name as deadbolt_installation",
        "threshold_types.name as threshold_type",
        "threshold_height_extension.value as threshold_ht",
        "finish_selection.finish_code as finish_selection",
        "glass_temp_ig.option_name as glass_temp",
        "jamb_width.width_label as jamb_width",
        "jamb_depth_int_to_ext.depth_value as jamb_depth",
        "hardware_prep_types.name as hardware_prep_type",
        "stile_width_thickness_of_door.size as stile_width_thickness"
      )
      .leftJoin("unit_size_types", Knex.raw("CAST(doors.unit_size_type AS INTEGER) = unit_size_types.id"))
      .leftJoin("unit_functions", Knex.raw("CAST(doors.unit_function AS INTEGER) = unit_functions.id"))
      .leftJoin("unit_configurations", Knex.raw("CAST(doors.unit_configuration AS INTEGER) = unit_configurations.id"))
      .leftJoin("arch_unit_types", Knex.raw("CAST(doors.arch_unit AS INTEGER) = arch_unit_types.id"))
      .leftJoin("arch_door_types", Knex.raw("CAST(doors.arch_door AS INTEGER) = arch_door_types.id"))
      .leftJoin("door_swing_types", Knex.raw("CAST(doors.door_swing_from_ext AS INTEGER) = door_swing_types.id"))
      .leftJoin("roller_latches_prep", Knex.raw("CAST(doors.roller_latches_prep AS INTEGER) = roller_latches_prep.id"))
      .leftJoin("pull_handles", Knex.raw("CAST(doors.pull_handles AS INTEGER) = pull_handles.id"))
      .leftJoin("deadbolt_installation_types", Knex.raw("CAST(doors.deadbolt_installation AS INTEGER) = deadbolt_installation_types.id"))
      .leftJoin("threshold_types", Knex.raw("CAST(doors.threshold_type AS INTEGER) = threshold_types.id"))
      .leftJoin("threshold_height_extension", Knex.raw("CAST(doors.threshold_ht AS INTEGER) = threshold_height_extension.id"))
      .leftJoin("finish_selection", Knex.raw("CAST(doors.finish_selection AS INTEGER) = finish_selection.id"))
      .leftJoin("glass_temp_ig", Knex.raw("CAST(doors.glass_temp AS INTEGER) = glass_temp_ig.id"))
      .leftJoin("jamb_width", Knex.raw("CAST(doors.jamb_width AS INTEGER) = jamb_width.id"))
      .leftJoin("jamb_depth_int_to_ext", Knex.raw("CAST(doors.jamb_depth AS INTEGER) = jamb_depth_int_to_ext.id"))
      .leftJoin("hardware_prep_types", Knex.raw("CAST(doors.hardware_prep_type AS INTEGER) = hardware_prep_types.id"))
      .leftJoin("stile_width_thickness_of_door", Knex.raw("CAST(doors.stile_width_thickness AS INTEGER) = stile_width_thickness_of_door.id"))


      .orderBy("doors.id", "desc");

    res.status(200).json({
      status: true,
      message: "Doors fetched successfully",
      data: doors
    });
  } catch (err) {
    console.error("Error fetching doors:", err);
    res.status(500).json({
      status: false,
      message: "Fetch failed",
      error: err.message
    });
  }
};


//  Get all or specific door records
const getDoors = async (req, res) => {
 try {

    const { id } = req.params;

    const doors = await Knex("doors")
      .select(
        "doors.*",
        "unit_size_types.name as unit_size_type",
        "unit_functions.name as unit_function",
        "unit_configurations.name as unit_configuration",
        "arch_unit_types.type_name as arch_unit",
        "arch_door_types.type_name as arch_door",
        "door_swing_types.name as door_swing_from_ext",
        "roller_latches_prep.name as roller_latches_prep",
        "pull_handles.type_code as pull_handles",
        "deadbolt_installation_types.name as deadbolt_installation",
        "threshold_types.name as threshold_type",
        "threshold_height_extension.value as threshold_ht",
        "finish_selection.finish_code as finish_selection",
        "glass_temp_ig.option_name as glass_temp",
        "jamb_width.width_label as jamb_width",
        "jamb_depth_int_to_ext.depth_value as jamb_depth",
        "hardware_prep_types.name as hardware_prep_type",
        "stile_width_thickness_of_door.size as stile_width_thickness"
      )
      .leftJoin("unit_size_types", Knex.raw("CAST(doors.unit_size_type AS INTEGER) = unit_size_types.id"))
      .leftJoin("unit_functions", Knex.raw("CAST(doors.unit_function AS INTEGER) = unit_functions.id"))
      .leftJoin("unit_configurations", Knex.raw("CAST(doors.unit_configuration AS INTEGER) = unit_configurations.id"))
      .leftJoin("arch_unit_types", Knex.raw("CAST(doors.arch_unit AS INTEGER) = arch_unit_types.id"))
      .leftJoin("arch_door_types", Knex.raw("CAST(doors.arch_door AS INTEGER) = arch_door_types.id"))
      .leftJoin("door_swing_types", Knex.raw("CAST(doors.door_swing_from_ext AS INTEGER) = door_swing_types.id"))
      .leftJoin("roller_latches_prep", Knex.raw("CAST(doors.roller_latches_prep AS INTEGER) = roller_latches_prep.id"))
      .leftJoin("pull_handles", Knex.raw("CAST(doors.pull_handles AS INTEGER) = pull_handles.id"))
      .leftJoin("deadbolt_installation_types", Knex.raw("CAST(doors.deadbolt_installation AS INTEGER) = deadbolt_installation_types.id"))
      .leftJoin("threshold_types", Knex.raw("CAST(doors.threshold_type AS INTEGER) = threshold_types.id"))
      .leftJoin("threshold_height_extension", Knex.raw("CAST(doors.threshold_ht AS INTEGER) = threshold_height_extension.id"))
      .leftJoin("finish_selection", Knex.raw("CAST(doors.finish_selection AS INTEGER) = finish_selection.id"))
      .leftJoin("glass_temp_ig", Knex.raw("CAST(doors.glass_temp AS INTEGER) = glass_temp_ig.id"))
      .leftJoin("jamb_width", Knex.raw("CAST(doors.jamb_width AS INTEGER) = jamb_width.id"))
      .leftJoin("jamb_depth_int_to_ext", Knex.raw("CAST(doors.jamb_depth AS INTEGER) = jamb_depth_int_to_ext.id"))
      .leftJoin("hardware_prep_types", Knex.raw("CAST(doors.hardware_prep_type AS INTEGER) = hardware_prep_types.id"))
      .leftJoin("stile_width_thickness_of_door", Knex.raw("CAST(doors.stile_width_thickness AS INTEGER) = stile_width_thickness_of_door.id"))
      .where("doors.id", id)
      .orderBy("doors.id", "desc");

    res.status(200).json({
      status: true,
      message: "Doors fetched successfully",
      data: doors
    });
  } catch (err) {
    console.error("Error fetching doors:", err);
    res.status(500).json({
      status: false,
      message: "Fetch failed",
      error: err.message
    });
  }
}


// const getDoorsByCustomerId = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch all doors with joins
//     const doors = await Knex("doors")
//       .select(
//         "doors.*",
//         "unit_size_types.name as unit_size_type",
//         "unit_functions.name as unit_function",
//         "unit_configurations.name as unit_configuration",
//         "arch_unit_types.type_name as arch_unit",
//         "arch_door_types.type_name as arch_door",
//         "door_swing_types.name as door_swing_from_ext",
//         "roller_latches_prep.name as roller_latches_prep",
//         "pull_handles.type_code as pull_handles",
//         "deadbolt_installation_types.name as deadbolt_installation",
//         "threshold_types.name as threshold_type",
//         "threshold_height_extension.value as threshold_ht",
//         "finish_selection.finish_code as finish_selection",
//         "glass_temp_ig.option_name as glass_temp",
//         "jamb_width.width_label as jamb_width",
//         "jamb_depth_int_to_ext.depth_value as jamb_depth",
//         "hardware_prep_types.name as hardware_prep_type",
//         "stile_width_thickness_of_door.size as stile_width_thickness"
//       )
//       .leftJoin("unit_size_types", Knex.raw("CAST(doors.unit_size_type AS INTEGER) = unit_size_types.id"))
//       .leftJoin("unit_functions", Knex.raw("CAST(doors.unit_function AS INTEGER) = unit_functions.id"))
//       .leftJoin("unit_configurations", Knex.raw("CAST(doors.unit_configuration AS INTEGER) = unit_configurations.id"))
//       .leftJoin("arch_unit_types", Knex.raw("CAST(doors.arch_unit AS INTEGER) = arch_unit_types.id"))
//       .leftJoin("arch_door_types", Knex.raw("CAST(doors.arch_door AS INTEGER) = arch_door_types.id"))
//       .leftJoin("door_swing_types", Knex.raw("CAST(doors.door_swing_from_ext AS INTEGER) = door_swing_types.id"))
//       .leftJoin("roller_latches_prep", Knex.raw("CAST(doors.roller_latches_prep AS INTEGER) = roller_latches_prep.id"))
//       .leftJoin("pull_handles", Knex.raw("CAST(doors.pull_handles AS INTEGER) = pull_handles.id"))
//       .leftJoin("deadbolt_installation_types", Knex.raw("CAST(doors.deadbolt_installation AS INTEGER) = deadbolt_installation_types.id"))
//       .leftJoin("threshold_types", Knex.raw("CAST(doors.threshold_type AS INTEGER) = threshold_types.id"))
//       .leftJoin("threshold_height_extension", Knex.raw("CAST(doors.threshold_ht AS INTEGER) = threshold_height_extension.id"))
//       .leftJoin("finish_selection", Knex.raw("CAST(doors.finish_selection AS INTEGER) = finish_selection.id"))
//       .leftJoin("glass_temp_ig", Knex.raw("CAST(doors.glass_temp AS INTEGER) = glass_temp_ig.id"))
//       .leftJoin("jamb_width", Knex.raw("CAST(doors.jamb_width AS INTEGER) = jamb_width.id"))
//       .leftJoin("jamb_depth_int_to_ext", Knex.raw("CAST(doors.jamb_depth AS INTEGER) = jamb_depth_int_to_ext.id"))
//       .leftJoin("hardware_prep_types", Knex.raw("CAST(doors.hardware_prep_type AS INTEGER) = hardware_prep_types.id"))
//       .leftJoin("stile_width_thickness_of_door", Knex.raw("CAST(doors.stile_width_thickness AS INTEGER) = stile_width_thickness_of_door.id"))
//       .where("doors.customer_id", id)
//       .orderBy("doors.id", "desc");

//     // Calculate sum of total_estimated_cost and total_price
//     const totals = await Knex("doors")
//       .where("customer_id", id)
//       .sum({ total_estimated_cost: Knex.raw("CAST(total_estimated_cost AS BIGINT)") })
//       .sum({ total_price: Knex.raw("CAST(total_price AS BIGINT)") })
//       .first();

//     res.status(200).json({
//       status: true,
//       message: "Doors fetched successfully",
//       data: doors,
//       total_estimated_cost: Number(totals.total_estimated_cost || 0),
//       total_price: Number(totals.total_price || 0)
//     });
//   } catch (err) {
//     console.error("Error fetching doors:", err);
//     res.status(500).json({
//       status: false,
//       message: "Fetch failed",
//       error: err.message
//     });
//   }
// };

const getDoorsByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;

    const doors = await Knex("doors")
      .select(
        "doors.*",
        "unit_size_types.name as unit_size_type",
        "unit_functions.name as unit_function",
        "unit_configurations.name as unit_configuration",
        "arch_unit_types.type_name as arch_unit",
        "arch_door_types.type_name as arch_door",
        "door_swing_types.name as door_swing_from_ext",
        "roller_latches_prep.name as roller_latches_prep",
        "pull_handles.type_code as pull_handles",
        "deadbolt_installation_types.name as deadbolt_installation",
        "threshold_types.name as threshold_type",
        "threshold_height_extension.value as threshold_ht",
        "finish_selection.finish_code as finish_selection",
        "glass_temp_ig.option_name as glass_temp",
        "jamb_width.width_label as jamb_width",
        "jamb_depth_int_to_ext.depth_value as jamb_depth",
        "hardware_prep_types.name as hardware_prep_type",
        "stile_width_thickness_of_door.size as stile_width_thickness"
      )
      .leftJoin("unit_size_types", Knex.raw("CAST(doors.unit_size_type AS INTEGER) = unit_size_types.id"))
      .leftJoin("unit_functions", Knex.raw("CAST(doors.unit_function AS INTEGER) = unit_functions.id"))
      .leftJoin("unit_configurations", Knex.raw("CAST(doors.unit_configuration AS INTEGER) = unit_configurations.id"))
      .leftJoin("arch_unit_types", Knex.raw("CAST(doors.arch_unit AS INTEGER) = arch_unit_types.id"))
      .leftJoin("arch_door_types", Knex.raw("CAST(doors.arch_door AS INTEGER) = arch_door_types.id"))
      .leftJoin("door_swing_types", Knex.raw("CAST(doors.door_swing_from_ext AS INTEGER) = door_swing_types.id"))
      .leftJoin("roller_latches_prep", Knex.raw("CAST(doors.roller_latches_prep AS INTEGER) = roller_latches_prep.id"))
      .leftJoin("pull_handles", Knex.raw("CAST(doors.pull_handles AS INTEGER) = pull_handles.id"))
      .leftJoin("deadbolt_installation_types", Knex.raw("CAST(doors.deadbolt_installation AS INTEGER) = deadbolt_installation_types.id"))
      .leftJoin("threshold_types", Knex.raw("CAST(doors.threshold_type AS INTEGER) = threshold_types.id"))
      .leftJoin("threshold_height_extension", Knex.raw("CAST(doors.threshold_ht AS INTEGER) = threshold_height_extension.id"))
      .leftJoin("finish_selection", Knex.raw("CAST(doors.finish_selection AS INTEGER) = finish_selection.id"))
      .leftJoin("glass_temp_ig", Knex.raw("CAST(doors.glass_temp AS INTEGER) = glass_temp_ig.id"))
      .leftJoin("jamb_width", Knex.raw("CAST(doors.jamb_width AS INTEGER) = jamb_width.id"))
      .leftJoin("jamb_depth_int_to_ext", Knex.raw("CAST(doors.jamb_depth AS INTEGER) = jamb_depth_int_to_ext.id"))
      .leftJoin("hardware_prep_types", Knex.raw("CAST(doors.hardware_prep_type AS INTEGER) = hardware_prep_types.id"))
      .leftJoin("stile_width_thickness_of_door", Knex.raw("CAST(doors.stile_width_thickness AS INTEGER) = stile_width_thickness_of_door.id"))
      .where("doors.customer_id", id)
      .orderBy("doors.id", "desc");

    const totals = await Knex("doors")
      .where("customer_id", id)
      .sum({ total_estimated_cost: Knex.raw("CAST(total_estimated_cost AS NUMERIC)") })
      .sum({ total_price: Knex.raw("CAST(total_price AS NUMERIC)") })
      .first();

    const format = (val) => Number(val || 0).toFixed(2);

    res.status(200).json({
      status: true,
      message: "Doors fetched successfully",
      data: doors,
      total_estimated_cost: format(totals.total_estimated_cost),
      total_price: format(totals.total_price)
    });
  } catch (err) {
    console.error("Error fetching doors:", err);
    res.status(500).json({
      status: false,
      message: "Fetch failed",
      error: err.message
    });
  }
};



module.exports = { postDoorCalculation, getAllDoors, putDoorCalculation, upload, getDoors, getDoorsByCustomerId };
