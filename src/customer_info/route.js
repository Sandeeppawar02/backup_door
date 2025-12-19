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
  upload,
  postInsertCustomerInfo,
  getCustomerInfo,
  putCustomerInfo,
  getCustomerInfoById,
  getCustomerDoorById,
  getDoorImage,
  getCunstomerInfoByUserId,
  getTransaction,
  getTransactionById,  
  getTransactionByUserId,
  getTransactionData
} = require("./controller");

app.post("/customer/customerinfo",
  upload.fields([
   { name: 'image', maxCount: 10 },
  ]),
  postInsertCustomerInfo
);
app.put("/customer/customerinfo/:id",
  upload.fields([
   { name: 'image', maxCount: 10 },
  ]),
  putCustomerInfo
);
app.get('/customer/getcunstomerinfo', getCustomerInfo);
app.get('/customer/getcunstomerinfo/:id', getCustomerInfoById)
app.get('/customer/getcunstomerdoor/:id', getCustomerDoorById)
app.get('/customer/getcunstomerinfobyuserid/:id', getCunstomerInfoByUserId)
app.get('/customer/getdoorimage/:id', getDoorImage)
app.get("/transactions", getTransaction);
app.get("/transactions/:id", getTransactionById);  
app.get("/transactions/user/:id", getTransactionByUserId);


// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", status: false });
});

module.exports = app;
