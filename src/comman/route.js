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
getDoorSwingTypes,
getHardwarePrepTypes,
getThresholdTypes,
getUnitConfigurations,
getUnitFunctions,
getUnitSizeTypes,
getJambDepthIntToExt,
getStileWidthThicknessOfDoor,
getThresholdHeightExtension,
getArchUnitTypes,
getJambWidth,
getRollerLatchesPrep,
getPullHandles,
getGlassTempIg,
getFinishSelection,
getDeadboltInstallationTypes
} = require("./controller");

// Routes
app.get("/common/getdoorswingtypes", getDoorSwingTypes);
app.get("/common/gethardwarepreptypes", getHardwarePrepTypes);
app.get("/common/getthresholdtypes", getThresholdTypes);
app.get("/common/getunitconfigurations", getUnitConfigurations);
app.get("/common/getunitfunctions", getUnitFunctions);
app.get("/common/getunitsizetypes", getUnitSizeTypes);
app.get("/common/getjambdepthinttoext", getJambDepthIntToExt);
app.get("/common/getstilewidththicknessofdoor", getStileWidthThicknessOfDoor);
app.get("/common/getthresholdheightextension", getThresholdHeightExtension);
app.get("/common/getarchunittypes", getArchUnitTypes);
app.get("/common/getjambwidth", getJambWidth);
app.get("/common/getrollerlatchesprep", getRollerLatchesPrep);
app.get("/common/getpullhandles", getPullHandles);
app.get("/common/getglasstempig", getGlassTempIg);
app.get("/common/getfinishselection", getFinishSelection);
app.get("/common/getdeadboltinstallationtypes", getDeadboltInstallationTypes);



// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", status: false });
});

module.exports = app;
