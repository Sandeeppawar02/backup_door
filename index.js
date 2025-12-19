const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require("path");
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json()); // Replaces bodyParser.json()
app.use(express.urlencoded({ extended: true })); // Replaces bodyParser.urlencoded()
app.use(cors());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Import routes
const CompanyRegister = require('./src/company/route');
const UserRegister = require('./src/user/route');
const AdminCategory = require('./src/admin/category/routes');
const AdminSubCategory = require('./src/admin/subcategory/routes');
const AdminDoor = require('./src/doors/routes');
const UserCommon = require('./src/comman/route');
const AdminRoles  = require('./src/admin/roles/route');
const AdminImage = require('./src/image/route')
const Stripe = require('./src/stripe/route')
const PaymentRoutes = require('./src/payment/route');
const PlanRoutes = require('./src/plans/route');
const DoorCalRoutes = require('./src/door_calculation/route');
const AdminCompanyUser = require('./src/admin/company_users/route');
const CustomerRouter = require("./src/customer_info/route");



// Test route
app.get('/', (req, res) => {
  res.send("Application Started !!!!!!");
});

// API routes
app.use("/api", CompanyRegister);
app.use("/api", UserRegister);
app.use("/api", AdminCategory);
app.use("/api", AdminSubCategory);
app.use("/api", AdminDoor);
app.use("/api", UserCommon);
app.use("/api", AdminRoles);
app.use("/api", AdminImage);
app.use("/api", Stripe);
app.use('/api', PaymentRoutes);
app.use('/api', PlanRoutes);
app.use('/api', DoorCalRoutes);
app.use('/api', AdminCompanyUser);
app.use('/api', CustomerRouter);



// Server port
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
