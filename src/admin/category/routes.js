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
  postAdminCategory,
  putAdminCategory,
  getAdminCategory,
  getcategoryByid,
  deletecategoryByid,
  getcategoryByIdwithSubcategory
} = require("./controller");

// Routes
app.post("/admin/category", postAdminCategory);
app.put("/admin/putcategory/:id", putAdminCategory);
app.get("/admin/getcategory", getAdminCategory);
app.get('/admin/getcategory/:id', getcategoryByid);
app.get('/admin/getcategory_subcategory/:id', getcategoryByIdwithSubcategory);
app.delete('/admin/deletecategory/:id', deletecategoryByid);


// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", status: false });
});

module.exports = app;
