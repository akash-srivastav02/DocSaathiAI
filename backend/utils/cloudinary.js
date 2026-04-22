// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Helper: upload a raw buffer → returns secure_url + public_id
// const uploadBuffer = (buffer, folder = 'docsaathi') => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder, resource_type: 'image' },
//       (error, result) => (error ? reject(error) : resolve(result))
//     );
//     stream.end(buffer);
//   });
// };

// module.exports = { cloudinary, uploadBuffer };

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Upload image buffer (for photos/signatures) ───────────────────────────────
const uploadBuffer = (buffer, folder = 'docsaathi') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
};

// ── Upload PDF buffer (for PDF compress/editor) ───────────────────────────────
const uploadPDFBuffer = (buffer, folder = 'docsaathi/pdfs') => {
  const { Readable } = require('stream');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',    // ← must be raw for PDF
        format:        'pdf',
        public_id:     `pdf_${Date.now()}`,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

module.exports = { cloudinary, uploadBuffer, uploadPDFBuffer };