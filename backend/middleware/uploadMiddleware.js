// const multer = require('multer');

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const allowed = [
//     'image/jpeg',
//     'image/jpg',
//     'image/png',
//     'image/webp',
//     'application/pdf',
//   ];
//   if (allowed.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only JPG, PNG, WEBP, PDF files are allowed.'), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max (PDFs can be large)
// });

// module.exports = upload;

const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'application/pdf',   // ← PDF must be here
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, PDF allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;