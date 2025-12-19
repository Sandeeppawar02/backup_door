const express = require("express");
const compression = require("compression");
const cors = require("cors");

// Create app
const app = express();
// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(compression());
app.use(cors());
const { checkPermissions } = require("../middleware/admins");
const { modules, permissions } = require("../utils/constants");

// Import routes/controllers
const {
  upload,
  postUserRegister,
  postUserLogin,
  getUsers,
  postForgotPassword,
  postUserForgotResendOtp,
  getUserByid,
  postUserForgotPasswordOtp,
  postVerifyingIdentity,
  putUserById,
  deleteUserPermanent 
} = require("./controller");

// Routes
app.post("/user/register", postUserRegister);
app.post("/user/login", postUserLogin);
app.get('/user/getusers/:id', getUsers);
app.put("/user/updateusers/:id",
  upload.fields([
   { name: 'company_logo', maxCount: 1 },
   { name: 'profile_img', maxCount: 1 },
  ]),
  putUserById
);
app.post('/user/forgotpassword', postForgotPassword);
app.post('/user/ForgotResendOtp', postUserForgotResendOtp);
app.get('/user/getuser/:id', getUserByid);
// Handle identity verification for forgot password
app.post("/user/forgot-password-otp", postUserForgotPasswordOtp);
// Handle resending otp - forgot-password-otp
app.post("/user/verifying-identity", postVerifyingIdentity);
// Delete user permanently
app.delete("/user/delete/:userId", deleteUserPermanent);

// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", status: false });
});

module.exports = app;
