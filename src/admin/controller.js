require('dotenv').config();
const Joi = require("joi");
const Knex = require("../../db/knex");
const pool = require("../../db/dbConfig");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


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
const localUploadPath = path.resolve(__dirname, '../../uploads'); // ✅ fixed path
if (!fs.existsSync(localUploadPath)) {
  fs.mkdirSync(localUploadPath, { recursive: true });
}


const {
  validateEmail,
  validatePhoneNumber,
  checkUserById,
  getUserByPhone,
  getUserByUsername,
  verifyPassword,
  verifyUsername,
} = require("../utils/userService");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");

const {
  generatenewHash,
  sendOTP,
  generateAccessCode,
  TimeDiffrance,
  VerifyEmail,
  generateVerificationToken,
  checkUserNameandEmail
} = require("../utils/functions");


// Register schema
const registerSchema = Joi.object({
  first_name: Joi.string().required().min(3),
  last_name: Joi.string().required().min(3),
  password: Joi.string().required().min(8),
  // company_id: Joi.number().required(),
  email: Joi.string().email().required(),
  company_email: Joi.string().email().required(),
  mobile_number: Joi.string().required(),
  role_id: Joi.number().required(),
  company_name: Joi.string().required().min(3), // You had min(20) — adjust if needed
  user_count: Joi.number().required(),
  description: Joi.string().required(),
});

// Register schema
const updateRegisterSchema = Joi.object({
  first_name: Joi.string().required().min(3),
  last_name: Joi.string().required().min(3),
  // company_id: Joi.number().required(),
  email: Joi.string().email().required(),
  company_email: Joi.string().email().required(),
  mobile_number: Joi.string().required(),
  role_id: Joi.number().required(),
  category_id: Joi.number().required(),
  sub_category_id: Joi.number().required(),
  company_name: Joi.string().required().min(3), // You had min(20) — adjust if needed
  user_count: Joi.number().required(),
  description: Joi.string().required(),
});


//Forgot Password
const userForgotPassword = Joi.object({
  id: Joi.number().required(),
  new_password: Joi.string().required().min(8),
  confirm_password: Joi.string().required().min(8),
  //  device_token: Joi.string().required(),
});

//forgetSchema
const forgetSchema = Joi.object({
  verify_field: Joi.string().required(),
  //device_token: Joi.string().required()
});

//resendotpSchema
const resendotpSchema = Joi.object({
  id: Joi.number().required(),
});


const postUserRegister = async (req, res) => {
  try {
    // Validate schema
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.message, status: false });
    }

    let {
      first_name,
      last_name,
      email,
      password,
      mobile_number,
      company_id,
      role_id,
      company_name,
      user_count,
      description,
      company_email,
    } = req.body;

    // company_name = company_name.toLowerCase();
    // first_name = first_name.toLowerCase();
    // last_name = last_name.toLowerCase();
    email = email.toLowerCase();
    company_email = company_email.toLowerCase();
    mobile_number = mobile_number.toLowerCase();

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).send({ error: "Email is not valid", status: false });
    }
    if (!validateEmail(company_email)) {
      return res.status(400).send({ error: "Company email is not valid", status: false });
    }

    // Validate phone number
    if (!validatePhoneNumber(mobile_number)) {
      return res.status(400).send({ error: "Phone number is not valid", status: false });
    }

    // Check if email already exists
    const existingEmail = await Knex("users").where({ email }).first();
    if (existingEmail) {
      return res.status(400).send({ error: "User email already exists.", status: false });
    }

    // Check if phone already exists
    const existingPhone = await Knex("users").where({ mobile_number }).first();
    if (existingPhone) {
      return res.status(400).send({ error: "Phone number already exists.", status: false });
    }

    // Check if company_email exists
    let company = await Knex("company").where({ company_email }).first();

    if (!company) {
      // Insert new company
      [company] = await Knex("company")
        .insert({
          company_name,
          user_count,
          company_email,
          description,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

   let newUser , userPayload;
    if (role_id == 1){
          // Insert new user
        [newUser] = await Knex("users")
          .insert({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            mobile_number,
            company_id: company.id,
            role_id,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning("*");

        userPayload = {
          user_id: newUser.id,
          email: newUser.email,
        };

    }else{
         // Insert new user
          [newUser] = await Knex("users")
            .insert({
              first_name,
              last_name,
              email,
              password: hashedPassword,
              mobile_number,
              company_id: company.id,
              role_id,
              is_verified : true,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .returning("*");

          userPayload = {
            user_id: newUser.id,
            email: newUser.email,
          };

    }

    // Generate tokens
    const accessToken = generateAccessToken(userPayload.user_id);
    const refreshToken = generateRefreshToken(userPayload.user_id);

    const response = {
      message: "Registration successful!",
      data: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        mobile_number: newUser.mobile_number,
        company_id: company.id,
        role_id: newUser.role_id,
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

const postUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !validateEmail(email)) {
      return res.status(400).send({ error: "Email is not valid", status: false });
    }

    if (!password) {
      return res.status(400).send({ error: "Password is required", status: false });
    }

    // Get user with role and company
    const user = await checkUserNameandEmail(email);
    if (!user) {
      return res.status(404).send({ error: "User does not exist.", status: false });
    }

    // Password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid password", status: false });
    }

    // Generate tokens
    const userPayload = {
      user_id: user.id,
      email: user.email,
    };

    const accessToken = generateAccessToken(userPayload.user_id);
    const refreshToken = generateRefreshToken(userPayload.user_id);

    // Optional: Re-fetch company if needed
    let company = null;
    if (user.company_id) {
      company = await Knex("company").where({ id: user.company_id }).first();
    }

    // Build response
    const response = {
      message: "Login successful!",
      data: {
        ...user,
        company,
      },
      status: true,
      access: { token: accessToken, issued_at: new Date() },
      refresh: { token: refreshToken, issued_at: new Date() },
    };

    res.status(200).send(response);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send({ error: err.message, status: false });
  }
};


const getUsers = async (req, res) => {
  try {
    const company_id = req.params.id;
    const getQuery = Knex("users").select().where({company_id}).andWhereNot({role_id :1}).returning('*').toString();

    const result = await pool.query(getQuery);

    res.status(200).send({
      message: "Get all User successful!",
      status: true,
      results: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};


const postUserForgotPasswordOtp = async (req, res) => {
  try {
    //Validate Request Parameter Object.
    const { error } = forgetSchema.validate(req.body);

    if (error) {
      // console.log("Inside schema error", req.body);
      res.status(400).send({ error: error.message, status: false });
      return;
    }
    //console.log("After schema validation");

    const verify_field =
      typeof req.body.verify_field === "string"
        ? req.body.verify_field.trim()
        : "";

    // console.log("After search clause");

    // Check the record in our database
    const user = await getUserByPhone(verify_field);
    if (!user) {
      res
        .status(404)
        .send({ error: "No such user found in our Database.", status: false });
      return;
    }

    //console.log("After check user error");

    //Send Push Message Notification on Device for Forgot Password
    //const forgotp= randomize('0',6);
    const { otp, expiry } = await generateAccessCode();
    const mobile_number = verify_field;

    // Check forgot_otp previous otp for the same user
    const checkOtp = Knex("forgot_otp")
      .where({ user_id: user.id })
      .toString();
    const userResult = await pool.query(checkOtp);
    const otpResult = userResult.rows[0];
    if (!otpResult) {
      const insertQuery = Knex("forgot_otp")
        .insert({
          user_id: user.id,
          otp: otp,
          status: 1,
          expires_at: expiry,
        })
        .toString();
      await pool.query(insertQuery);
       console.log("After otp insert");
    } else {
      const currentTime = new Date();
      const diff = TimeDiffrance(
        otpResult.expires_at,
        currentTime.toISOString(),
        "m",
      );
      if (diff > 0 || diff < 0) {
        const now = moment();
        const otp_updated_at = now.format("YYYY-MM-DD HH:mm:ss Z");

        const updateQuery = Knex("forgot_otp")
          .update({
            otp: otp,
            status: 1,
            updated_at: otp_updated_at,
            expires_at: expiry,
          })
          .where({ user_id: user.id })
          .toString();
        await pool.query(updateQuery);
      } else {
        return res.status(400).send({
          error: "your otp has expired Use the Resend OTP option  !",
          status: false,
        });
      }
    }

    // Send OTP - Twilio
    // await sendOTP(otp, phone);

    //API Response
    res.status(200).send({
      data: user,
      status: true,
      otp: otp,
      message: "OTP sent! Please verify it to change the password.",
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err.message, status: false });
  }
};

const postForgotPassword = async (req, res) => {
  try {
    // Validate Schema
    const { error } = userForgotPassword.validate(req.body);
    if (error) {
      res.status(400).send({ error: error.message, status: false });
      return;
    }

    let { new_password, confirm_password, id } = req.body;

    // Check user
    const user = await checkUserById(id);
    if (!user) {
      res
        .status(404)
        .send({ error: "No such user found in our Database.", status: false });
      return;
    }

    // Check new password and confirm password
    if (new_password !== confirm_password) {
      res.status(400).send({
        error: "New Password does not match with confirm password field",
        status: false,
      });
      return;
    }

    // Update user password
    new_password = new_password.trim();
    const encryptedPassword2 = await generatenewHash(new_password);
    const now = moment();
    const updated_at = now.format("YYYY-MM-DD HH:mm:ss Z");

    //const updatePasswordquery = `UPDATE register SET password=${encryptedPassword2}, updated_at='${updated_at}' WHERE user_id='${user_id}'`
    const updatePasswordquery = Knex("users")
      .update({ password: encryptedPassword2, updated_at: updated_at })
      .where({ id: id })
      .returning("*")
      .toString();

    const updatePasswordResult = await pool.query(updatePasswordquery);
    const updatePassword = updatePasswordResult.rows[0];

    const response = {
      message: "Password changed successfully!",
      data: user,
      status: true,
    };

    res.status(201).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message, status: false });
  }
};

const postUserForgotResendOtp = async (req, res) => {
  try {
    //Validate Request Schema
    const { error } = resendotpSchema.validate(req.body);
    if (error) {
      res.status(400).send({ error: error.message, status: false });
      return;
    }
    const { id } = req.body;

    // Check user
    const checkUser = await checkUserById(id);
    if (!checkUser) {
      res
        .status(404)
        .send({ error: "No such user found in our Database.", status: false });
      return;
    }

    //const checkPhonequery = `SELECT * FROM register WHERE phone=${phone}`
    const checkPhonequery = Knex("users")
      .where({ id: id })
      .toString();
    const phoneResult = await pool.query(checkPhonequery);
    const checkPhone = phoneResult.rows[0];
    if (!checkPhone) {
      res.status(404).send({
        error: "Phone number not associated with our user.",
        status: false,
      });
      return;
    }

    const phone = checkPhone.phone;
    const { otp, expiry } = await generateAccessCode();
    console.log("otp", otp, "expire", expiry);

    // Check OTP
    const otpQuery = Knex("forgot_otp")
      .select("otp")
      .where({ user_id :id })
      .toString();
    const otpResult = await pool.query(otpQuery);
    const checkOtp = otpResult.rows[0].otp;

    const now = moment();
    const otp_updated_at = now.format("YYYY-MM-DD HH:mm:ss Z");
    let updateOtp, updateResult;
    if (!checkOtp) {
      const updateOtpquery = Knex("forgot_otp")
        .insert({
          user_id: id,
          otp: otp,
          expires_at: expiry,
          status: "1",
          created_at: otp_updated_at,
          updated_at: otp_updated_at,
        })
        .returning("*")
        .toString();
      updateResult = await pool.query(updateOtpquery);
      updateOtp = updateResult.rows[0];
    } else {
      const updateOtpquery = Knex("forgot_otp")
        .update({ otp: otp, updated_at: otp_updated_at, expires_at: expiry })
        .where({ user_id:id, status: 1 })
        .returning("*")
        .toString();
      updateResult = await pool.query(updateOtpquery);
      updateOtp = updateResult.rows[0];
    }
    const response = {
      message: "resend OTP successful!",
      data: checkUser,
      otp: otp,
      status: true,
    };

    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message, status: false });
  }
};


const postVerifyingIdentity = async (req, res) => {
  try {
    console.log("verifyingIdentity.........!!!");
    //Validate Request Schema
    // const { error } = verifyUserSchema.validate(req.body);
    // if (error) {
    //   res.status(400).send({ error: error.message, status: false });
    //   return;
    // }
    // console.log("After schema validation");
    const { id, otp } = req.body;

    // Check user
    const user = await checkUserById(id);
    if (!user) {
      res
        .status(404)
        .send({ error: "No such user found in our Database.", status: false });
      return;
    }
    // console.log("After user validation");

    // Check OTP
    const otpQuery = Knex("forgot_otp").where({ user_id:id , otp }).toString();
    const otpResult = await pool.query(otpQuery);
    const checkOtp = otpResult.rows[0];
    console.log("checkOtp ::", checkOtp);
    if (!checkOtp) {
      res.status(404).send({ error: "Invalid OTP", status: false });
      return;
    }
    console.log("After otp check");

    //Regenrate otp and update database
    const now = moment();
    const otp_updated_at = now.format("YYYY-MM-DD HH:mm:ss Z");
    //const updateOtpquery = `UPDATE verify_otp SET otp=${resendotp}, updated_at='${otp_updated_at}' WHERE user_id='${user_id}' AND status='1' RETURNING *`
    const updateOtpquery = Knex("forgot_otp")
      .update({ status: 0, updated_at: otp_updated_at })
      .where({ user_id: id })
      .returning("*")
      .toString();
    const updateResult = await pool.query(updateOtpquery);
    const updateOtp = updateResult.rows[0];
    console.log("updateOtp ::", updateOtp);

    const response = {
      message: "OTP Successfully!",
      data: updateOtp,
      status: true,
    };

    res.status(201).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message, status: false });
  }
};



const getUserByid = async (req, res) => {
  try {
    const id = req.params.id;
    const getQuery = Knex("users as u")
      .select("u.*","roles.*")
      .leftJoin("roles", { "u.role_id": "roles.role_id" })
      .where("u.id", id)
      .toString();
    const result = await pool.query(getQuery);

    // const getQuery = Knex("users").select().where({ id }).toString();
    // const result = await pool.query(getQuery);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).send({ message: "User not found", status: false });
    }

    const company = await Knex("company").where({ id: user.company_id }).first();

    console.log("Company:", company); // Debug check

    const mergedData = {
      ...user,
      ...(company || {}), // Only merge if company is not null
    };

    res.status(200).send({
      message: "Get User successful!",
      status: true,
      results: [mergedData],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message, status: false });
  }
};


// ✅ Helper to normalize category_id/sub_category_id
const normalizeArray = (val) => {
  try {
    if (!val) return [];

    // Handle PostgreSQL array-style string: "{1,2}"
    if (typeof val === "string" && val.startsWith("{")) {
      return val
        .replace(/[{}]/g, "")
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((v) => !isNaN(v));
    }

    // Array: ensure numeric
    if (Array.isArray(val)) {
      return val.map(Number).filter((v) => !isNaN(v));
    }

    // Fallback single number
    const num = Number(val);
    return isNaN(num) ? [] : [num];
  } catch {
    return [];
  }
};

const putUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const files = req.files || {};
    const { company_logo: logoFile, profile_img: profileFile } = files;

    const info = JSON.parse(req.body.info || "{}");

    let {
      first_name,
      last_name,
      email,
      password,
      mobile_number,
      company_id,
      category_id,
      sub_category_id,
      role_id,
      company_name,
      user_count,
      description,
      company_email,
    } = info;

    // Normalize array inputs
    category_id = normalizeArray(category_id);
    sub_category_id = normalizeArray(sub_category_id);

    const s3BaseUrl =
      process.env.CLOUDFRONT_URL ||
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

    let companyLogoUrl = null;
    let profileImgUrl = null;

    // ✅ Upload company logo
    if (logoFile && logoFile[0]) {
      const file = logoFile[0];
      const fileName = `${Date.now()}_${file.originalname}`;
      fs.writeFileSync(path.join("uploads", fileName), file.buffer);

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `logos/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      await s3.send(new PutObjectCommand(uploadParams));
      companyLogoUrl = `${s3BaseUrl}/logos/${fileName}`;
    }

    // ✅ Upload profile image
    if (profileFile && profileFile[0]) {
      const file = profileFile[0];
      const fileName = `${Date.now()}_${file.originalname}`;
      fs.writeFileSync(path.join("uploads", fileName), file.buffer);

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `profiles/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      await s3.send(new PutObjectCommand(uploadParams));
      profileImgUrl = `${s3BaseUrl}/profiles/${fileName}`;
    }

    // ✅ Normalize text values
    const normalize = (s) => s?.toString().toLowerCase();
    company_name = normalize(company_name);
    first_name = normalize(first_name);
    last_name = normalize(last_name);
    email = normalize(email);
    company_email = normalize(company_email);
    mobile_number = normalize(mobile_number);

    // ✅ Validate
    if (!validateEmail(email))
      return res.status(400).send({ error: "Invalid email", status: false });

    if (!validateEmail(company_email))
      return res
        .status(400)
        .send({ error: "Invalid company email", status: false });

    if (!validatePhoneNumber(mobile_number))
      return res
        .status(400)
        .send({ error: "Invalid phone number", status: false });

    // ✅ Validate category/subcategory existence
    for (const catId of category_id) {
      const cat = await Knex("categories").where({ id: catId }).first();
      if (!cat)
        return res.status(400).send({
          error: `Invalid category_id ${catId}`,
          status: false,
        });
    }

    for (const subId of sub_category_id) {
      const sub = await Knex("sub_categories").where({ id: subId }).first();
      if (!sub)
        return res.status(400).send({
          error: `Invalid sub_category_id ${subId}`,
          status: false,
        });
    }

    // ✅ Create or Update Company
    let company = await Knex("company").where({ company_email }).first();

    if (!company) {
      [company] = await Knex("company")
        .insert({
          company_name,
          user_count,
          category_id,
          sub_category_id,
          company_email,
          description,
          company_logo: companyLogoUrl,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
    } else {
      [company] = await Knex("company")
        .update({
          company_name,
          user_count,
          category_id,
          sub_category_id,
          description,
          company_profile_status: true,
          company_logo: companyLogoUrl || company.company_logo,
          updated_at: new Date(),
        })
        .where({ id: company.id })
        .returning("*");
    }

    // ✅ Update User
    const [newUser] = await Knex("users")
      .update({
        first_name,
        last_name,
        email,
        mobile_number,
        company_id: company.id,
        profile_status: true,
        role_id,
        profile_img: profileImgUrl || undefined,
        updated_at: new Date(),
      })
      .where({ id })
      .returning("*");

    // ✅ Success Response
    return res.status(200).send({
      message: "User and company update successful!",
      data: {
        ...newUser,
        company_logo: company.company_logo,
        company_id: company.id,
      },
      status: true,
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).send({ error: err.message, status: false });
  }
};

module.exports = {
  upload,
  postUserRegister,
  postUserLogin,
  getUsers,
  postForgotPassword,
  postUserForgotResendOtp,
  getUserByid,
  postUserForgotPasswordOtp,
  postVerifyingIdentity,
  postForgotPassword,
  putUserById,
};

