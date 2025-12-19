const express = require("express");
const router = express.Router();
const {
  upload,
  uploadDoorFiles,
  getDoors,
  uploadDoorImageWithFiles,
  getSearchDoors,
  getDoorsByID
} = require("./controller");



// 🚪 PUT: Upload multiple .gltf/.bin files for an existing door by ID
// Expects: Form-data → images[] (max 10)
router.put("/upload-multiple/:id", upload.array("images", 10), uploadDoorFiles);
// 🚪 POST: Upload new door with .gltf/.bin + cover image
// Expects: Form-data → images[] and cover_image
router.post(
  "/upload-multiple",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "cover_image", maxCount: 1 }
  ]),
  uploadDoorImageWithFiles
);

// 📄 GET: Fetch all doors
router.get("/get-doors", getDoors);

// 📄 GET: Fetch a single door by ID
router.get("/get-doors/:id", getDoors);

// 🔍 GET: Search door_image table by name query (?q=)
router.get("/getsearcdoors", getSearchDoors);

// 📄 GET: Fetch door_image entry by ID
router.get("/getdoors/:id", getDoorsByID);


module.exports = router;


