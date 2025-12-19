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
getPlans
} = require("./controller");

// Routes
app.get('/palns/getplan', getPlans);

// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", status: false });
});

module.exports = app;
