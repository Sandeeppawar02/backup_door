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
  postAdminSubcategory,
  putAdminSubcategory,
  getAdminSubccategory,
  getSubcategoryByid,
  deleteSubcategoryByid
} = require("./controller");

// Routes
app.post("/admin/subcategory", postAdminSubcategory);
app.put("/admin/putsubcategory/:id", putAdminSubcategory);
app.get("/admin/getsubcategory", getAdminSubccategory);
app.get('/admin/getsubcategory/:id', getSubcategoryByid);
app.delete('/admin/deletesubcategory/:id', deleteSubcategoryByid);

// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", status: false });
});

module.exports = app;
