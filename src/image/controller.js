// src/doors/controller.js
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const knex = require('../../db/knex');
const pool = require('../../db/dbConfig');

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AWS SDK v3 Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Upload folder
const localUploadPath = path.resolve(__dirname, '../../uploads'); // ✅ fixed path
if (!fs.existsSync(localUploadPath)) {
  fs.mkdirSync(localUploadPath, { recursive: true });
}

 // Uploads GLTF & BIN files to S3 and local folder
const uploadDoorFiles = async (req, res) => {
  try {
    const id = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log("Uploaded files:", files.map(f => f.originalname));

    const record = {
      gltf_url: null,
      bin_url: null,
      local_gltfurl: null,
      local_binurl: null
    };

    const s3BaseUrl = process.env.CLOUDFRONT_URL || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    const serverBaseUrl = process.env.BASE_URL || `http://192.168.1.128:${process.env.PORT || 4000}`;

    for (const file of files) {
      const fileName = file.originalname;  // 🔥 Use original name only
      console.log("Processing file:", fileName);

      const localPath = path.join(localUploadPath, fileName);
      fs.writeFileSync(localPath, file.buffer);

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `osl_door/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const s3Url = `${s3BaseUrl}/osl_door/${fileName}`;
      const localUrl = `${serverBaseUrl}/uploads/${fileName}`;
      const ext = path.extname(fileName).toLowerCase();

      if (ext === '.gltf') {
        record.gltf_url = s3Url;
        record.local_gltfurl = localUrl;
      } else if (ext === '.bin') {
        record.bin_url = s3Url;
        record.local_binurl = localUrl;
      }
    }

    const [updated] = await knex('doors')
      .update({
        gltf_url: record.gltf_url,
        bin_url: record.bin_url,
        local_gltfurl: record.local_gltfurl,
        local_binurl: record.local_binurl,
        updated_at: knex.fn.now()
      })
      .where({ id })
      .returning(['id']);

    res.status(200).json({
      message: 'Upload success',
      doors: [
        {
          id: updated.id,
          gltf_url: record.gltf_url || null,
          bin_url: record.bin_url || null,
          local_gltfurl: record.local_gltfurl || null,
          local_binurl: record.local_binurl || null
        }
      ]
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

//  Get all or specific door records
const getDoors = async (req, res) => {
  try {
    const { id } = req.params;

    let query = knex('doors').select('*');

    if (id) {
      query = query.where({ id });
    }

    const result = await query;

    if (id && result.length === 0) {
      return res.status(404).json({ error: 'Door not found' });
    }

    res.status(200).json({ doors: result });
  } catch (err) {
    console.error('Get doors error:', err);
    res.status(500).json({ error: 'Failed to retrieve doors' });
  }
};

// Search doors by name with pagination
const getSearchDoors = async(req,res)=>{
  try {
    const q = req.query.q || "";
    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.page) || 0;

    const query = knex('door_image')
      .select()
      .whereILike("name", `%${q}%`)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
      .toString();
    const data = await pool.query(query);

    res.status(200).json({
      status: true,
      results: data.rows,
    });
  } catch (err) {
    console.error('Get doors error:', err);
    res.status(500).json({ error: 'Failed to retrieve doors' });
  }
}
// Fetch door_image by ID
const getDoorsByID = async (req, res) => {
  try {
    const { id } = req.params;

    let query = knex('door_image').select('*');

    if (id) {
      query = query.where({ id });
    }

    const result = await query;

    if (id && result.length === 0) {
      return res.status(404).json({ error: 'Door not found' });
    }

    res.status(200).json({ doors: result });
  } catch (err) {
    console.error('Get doors error:', err);
    res.status(500).json({ error: 'Failed to retrieve doors' });
  }
};
// Upload GLTF/BIN + Cover Image (with metadata)
const uploadDoorImageWithFiles = async (req, res) => {
  try {
    const { name } = req.body;
    const files = req.files;
    const imageFiles = files.images || [];
    const coverImageFile = files.cover_image ? files.cover_image[0] : null;

    if (!imageFiles.length && !coverImageFile) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const s3BaseUrl = process.env.CLOUDFRONT_URL || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    const serverBaseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;

    const record = {
      name: name || `door_${Date.now()}`,
      gltf_url: null,
      bin_url: null,
      local_gltfurl: null,
      local_binurl: null,
      cover_image: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    };

    // Process multiple GLTF/BIN files
    for (const file of imageFiles) {
      const fileName = file.originalname;
      const localPath = path.join("uploads", fileName);
      fs.writeFileSync(localPath, file.buffer);

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `osl_door/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const s3Url = `${s3BaseUrl}/osl_door/${fileName}`;
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === ".gltf") {
        record.gltf_url = s3Url;
        record.local_gltfurl = `${serverBaseUrl}/uploads/${fileName}`;
      } else if (ext === ".bin") {
        record.bin_url = s3Url;
        record.local_binurl = `${serverBaseUrl}/uploads/${fileName}`;
      }
    }

    // Process cover image separately
    if (coverImageFile) {
      const fileName = coverImageFile.originalname;
      const localPath = path.join("uploads", fileName);
      fs.writeFileSync(localPath, coverImageFile.buffer);

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `osl_door/${fileName}`,
        Body: coverImageFile.buffer,
        ContentType: coverImageFile.mimetype
      };

      await s3.send(new PutObjectCommand(uploadParams));
      record.cover_image = `${s3BaseUrl}/osl_door/${fileName}`;
    }

    const [inserted] = await knex("door_image").insert(record).returning("*");

    res.status(200).json({
      message: "Upload and insert successful",
      door: inserted
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};



module.exports = { upload, uploadDoorFiles , getDoors, getDoors, uploadDoorImageWithFiles, getSearchDoors, getDoorsByID};
