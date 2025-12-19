require('dotenv').config();
const Joi = require("joi");
const Knex = require("../../db/knex");
const pool = require("../../db/dbConfig");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const {
  validateEmail,
  validatePhoneNumber,
  checkUserById,
  getUserByPhone,
  getUserByUsername,
} = require("../utils/userService");


// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

//  Controller to insert new customer info with optional image upload to AWS S3
const postInsertCustomerInfo = async (req, res) => {
  try {
    const files = req.files || {};
    const { image } = files;

    //  Parse info JSON string from form-data
    const info = JSON.parse(req.body.info || "{}");

    let {
      first_name,
      last_name,
      email,
      mobile_number,
      project_name,
      shipping_address,
      notes,
      type,
      width,
      height,
      depth,
      created_by,
      user_id
    } = info;

    const s3BaseUrl = process.env.CLOUDFRONT_URL || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

    let imageUrls = [];

    //  Upload each image to S3 and collect URLs
    if (Array.isArray(image)) {
      for (const file of image) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const localPath = path.join("uploads", fileName);
        fs.writeFileSync(localPath, file.buffer);

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

    // 🧪 Validate email/phone
    if (!validateEmail(email)) {
      return res.status(400).send({ error: "Invalid email", status: false });
    }
    if (!validatePhoneNumber(mobile_number)) {
      return res.status(400).send({ error: "Invalid phone number", status: false });
    }

    //  Insert customer_info
    const [customer] = await Knex("customer_info")
    .insert({
        first_name,
        last_name,
        email,
        mobile_number,
        project_name,
        shipping_address,
        type,
        notes,
        width,
        height,
        depth,
        img_url: imageUrls, //  Send native array
        user_id,
        created_by,
        created_at: new Date(),
        updated_at: new Date()
    })
    .returning("*");

    res.status(201).send({
      message: "Customer added successfully!",
      data: customer,
      status: true,
    });

  } catch (err) {
    console.error("Insert Error:", err);
    res.status(500).send({ error: err.message, status: false });
  }
};

// Controller to fetch all customer records from the database
const getCustomerInfo = async (req, res) => {
  try {
    // Modify the query to order by 'created_at' in descending order
    const getQuery = Knex("customer_info")
      .select()
      .orderBy('created_at', 'desc')  // Change 'created_at' to any column you want to order by
      .toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get all Customer successful!",
      status: true,
      results: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
}

//  Controller to update customer info by ID, including optional image re-upload
const putCustomerInfo = async (req,res)=>{
   try {
    const id = req.params.id;
    const files = req.files || {};
    const { image } = files;

    //  Parse info JSON string from form-data
    const info = JSON.parse(req.body.info || "{}");

    let {
      first_name,
      last_name,
      email,
      mobile_number,
      project_name,
      shipping_address,
      notes,
      type,
      width,
      height,
      depth,
      created_by,
      user_id
    } = info;

    const s3BaseUrl = process.env.CLOUDFRONT_URL || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

    let imageUrls = [];

    //  Upload each image to S3 and collect URLs
    if (Array.isArray(image)) {
      for (const file of image) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const localPath = path.join("uploads", fileName);
        fs.writeFileSync(localPath, file.buffer);

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

    // 🧪 Validate email/phone
    if (!validateEmail(email)) {
      return res.status(400).send({ error: "Invalid email", status: false });
    }
    if (!validatePhoneNumber(mobile_number)) {
      return res.status(400).send({ error: "Invalid phone number", status: false });
    }

    //  Insert customer_info
    const [customer] = await Knex("customer_info")
    .update({
        first_name,
        last_name,
        email,
        mobile_number,
        project_name,
        shipping_address,
        notes,
        type,
        width,
        height,
        depth,
        img_url: imageUrls, // ✅ Send native array
        user_id,
        created_by,
        created_at: new Date(),
        updated_at: new Date()
    })
    .where({id})
    .returning("*");

    res.status(201).send({
      message: "Customer Update successfully!",
      data: customer,
      status: true,
    });

  } catch (err) {
    console.error("Insert Error:", err);
    res.status(500).send({ error: err.message, status: false });
  }   
};

//  Controller to fetch a single customer's info by ID
const getCustomerInfoById = async (req,res) =>{
 try {
    const id = req.params.id;
    const getQuery = Knex("customer_info").select().where({id}).returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get Customer successful!",
      status: true,
      results: result.rows
    });

 } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }   
}

const getCunstomerInfoByUserId = async(req,res)=>{
 try {
    const id = req.params.id;
    const getQuery = Knex("customer_info")
    .select()
    .where("user_id",id).returning('*').toString();
    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get Customer Project successful!",
      status: true,
      results: result.rows
    });

 } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  } 
};

const getCustomerDoorById = async(req,res)=>{
 try {
    const id = req.params.id;
    const getQuery = Knex("customer_info")
    .select("customer_info.*","doors.*")
    .innerJoin("doors","doors.customer_id", "customer_info.id")
    .where("customer_info.id",id).returning('*').toString();
    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get Customer Door successful!",
      status: true,
      results: result.rows
    });

 } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  } 
};

const getDoorImage = async (req,res)=>{
  try {
    const id = req.params.id;
    const getQuery = Knex("doors")
    .select("doors.img_url")
    .where({id}).returning('*').toString();
    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get Customer Door successful!",
      status: true,
      results: result.rows
    });

 } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  } 
};

// Controller to fetch all transactions
const getTransaction = async (req, res) => {
  try {
    const limit = 15;  
    const page = req.query.page ? parseInt(req.query.page) : 1; 
    const offset = (page - 1) * limit;  

    // Count the total number of transactions in the 'transactions' table
    const countResult = await Knex("transactions")
      .count("id as total_count")
      .first(); 

    // If the count result is not found, send a response with an error message
    if (!countResult) {
      return res.status(500).send({ error: "Failed to count transactions.", status: false });
    }

    const totalCount = countResult.total_count;  
    const totalPages = Math.ceil(totalCount / limit); 

    // Fetch the transactions for the current page
    const transactions = await Knex("transactions")
      .select(
        "id", 
        "user_id", 
        "plan_id", 
        "amount", 
        "gateway_id", 
        "transaction_public_id", 
        "created_at", 
        "subscription", 
        "primary"
      )
      .orderBy("created_at", "desc") 
      .offset(offset)  
      .limit(limit);  

    // If no transactions are found, return an empty array with pagination info
    if (transactions.length === 0) {
      return res.status(200).json({
        status: true,
        data: [],
        total: totalCount,
        totalPages: totalPages,
        currentPage: page,
      });
    }

    // Send the response with transactions data, total count, and pagination information
    res.status(200).json({
      status: true,
      data: transactions,  
      total: totalCount,    
      totalPages: totalPages, 
      currentPage: page, 
    });

  } catch (err) {
    // Log error and send a response with a detailed error message
    console.error("Error fetching transactions:", err);
    res.status(500).send({ error: err.message, status: false });
  }
};

//getTransactionById – Fetch a single transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const id = req.params.id; 

   
    if (isNaN(id)) {
      return res.status(400).send({ error: "Invalid transaction ID", status: false });
    }

    const transaction = await Knex("transactions")
      .select()
      .where({ id })
      .first();  

    if (!transaction) {
      return res.status(404).send({ error: "Transaction not found", status: false });
    }

    res.status(200).json({
      status: true,
      data: transaction,
    });

  } catch (err) {
    console.error("Error fetching transaction:", err);
    res.status(500).send({
      error: "Failed to fetch transaction. Please try again later.",
      status: false,
    });
  }
};

//getTransactionByUserId – Fetch all transactions by user ID with pagination
const getTransactionByUserId = async (req, res) => {
  try {
    const userId = req.params.id; 

    
    if (isNaN(userId)) {
      return res.status(400).send({ error: "Invalid user ID", status: false });
    }

    const limit = 15;  
    const page = req.query.page ? parseInt(req.query.page) : 1; 
    const offset = (page - 1) * limit; 

    // Count the total number of transactions for the user
    const countQuery = Knex("transactions")
      .count("id as total_count")
      .where({ user_id: userId })
      .first(); 
    const res_count = await countQuery;

    if (!res_count) {
      return res.status(404).send({ error: "No transactions found for this user", status: false });
    }

    const totalcount = res_count.total_count;  
    const totalPages = Math.ceil(totalcount / limit);

    // Fetch the transactions for the user
    const transactions = await Knex("transactions")
      .select("id", "user_id", "plan_id", "amount", "gateway_id", "transaction_public_id", "created_at", "subscription", "primary")
      .where({ user_id: userId })
      .orderBy("created_at", "desc")
      .offset(offset)  
      .limit(limit); 

    // If no transactions found, send an empty array with pagination info
    if (transactions.length === 0) {
      return res.status(200).json({
        status: true,
        data: [],
        total: totalcount,
        totalPages: totalPages,
        currentPage: page,
      });
    }

    // Send the response with transactions and pagination info
    res.status(200).json({
      status: true,
      data: transactions, 
      total: totalcount,   
      totalPages: totalPages, 
      currentPage: page,
    });

  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error fetching user transactions:", err);

    // Send error response with a detailed error message
    res.status(500).send({
      error: "Failed to fetch user transactions. Please try again later.",
      status: false,
    });
  }
};


module.exports = {postInsertCustomerInfo, upload, getCustomerInfo, putCustomerInfo, getCustomerInfoById, getCustomerDoorById, getDoorImage, getCunstomerInfoByUserId,getTransaction, getTransactionById, getTransactionByUserId}