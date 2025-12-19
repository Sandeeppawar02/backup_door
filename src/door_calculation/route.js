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
postDoorCalculation,getAllDoors, putDoorCalculation, upload , getDoors, getDoorsByCustomerId
} = require("./controller");

const multiUpload = upload.fields([
  { name: "image", maxCount: 5 },
  { name: "background_image", maxCount: 1 },
]);



// app.post('/admin/doors-cal', upload, postDoorCalculation);
app.post("/admin/doors-cal", multiUpload, postDoorCalculation);


app.put('/admin/updatedoors-cal/:id', multiUpload, putDoorCalculation);
// app.put('/admin/updatedoors-cal/:id', upload.fields([{ name: "image" }]), putDoorCalculation);
app.get("/admin/door/all", getAllDoors);
// 📄 GET: Fetch a single door by ID
app.get("/admin/get-doors/:id", getDoors);
app.get("/admin/get-doors-bycustomerid/:id", getDoorsByCustomerId);

// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", status: false });
});

module.exports = app;