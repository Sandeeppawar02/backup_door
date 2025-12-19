const express = require("express");
const compression = require("compression");
const cors = require("cors");

// Create app
const app = express();

// Middleware
app.use(express.json()); // replaces bodyParser.json()
app.use(express.urlencoded({ extended: true })); // replaces bodyParser.urlencoded()
app.use(compression());
app.use(cors());

// Import routes/controllers
const {
  postCompanyRegister,
  getCompany,
  updateCompany,
  deleteCompanyById,
  getCompanyById,
  updateCompanyActivestatus, 
  updateUserActivestatus
} = require("./controller");

// Routes
app.post("/company/register", postCompanyRegister);
app.put("/company/update-company/:id", updateCompany);
app.get("/company/get-company", getCompany);
app.get("/company/get-company/:id", getCompanyById);
app.delete("/company/delete-company/:id", deleteCompanyById);
app.put("/company/update-companyactive-status/:id", updateCompanyActivestatus);
app.put("/company/update-usersactive-status/:id", updateUserActivestatus);


// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", status: false });
});

module.exports = app;
