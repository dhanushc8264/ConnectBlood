const multer = require('multer');

// ✅ Use memory storage
const storage = multer.memoryStorage();

// ✅ File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("only jpeg and png allowed"), false);
  }
};

// ✅ Configure upload
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
});

// ✅ EXPORT
module.exports = upload;
