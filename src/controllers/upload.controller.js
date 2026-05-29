const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID: uuidv4 } = require('crypto');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info('Upload directory created', { path: UPLOAD_DIR });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

/**
 * Upload a single product image.
 * Returns the public URL of the uploaded file.
 */
const uploadProductImage = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'No image file provided',
    });
  }

  const fileName = req.file.filename;
  const publicUrl = `/uploads/products/${fileName}`;

  logger.info('Product image uploaded', { fileName, size: req.file.size });

  res.status(200).json({
    status: 'success',
    data: {
      url: publicUrl,
      fileName,
      size: req.file.size,
    },
  });
});

module.exports = {
  uploadProductImage,
  uploadMiddleware: upload.single('image'),
};
