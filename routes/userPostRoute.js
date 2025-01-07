const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadImage, getAllImages } = require("../controllers/userPostController");
const authenticateUser = require("../middlewares/authenaticateUser")

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/upload", authenticateUser, upload.single("image"), uploadImage);

router.get("/getAll", getAllImages);

module.exports = router;
