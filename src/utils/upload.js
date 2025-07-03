const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './src/uploads/products');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    const sanitizedBaseName = baseName
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase()
                .replace(/_{2,}/g, '_'); // Replace multiple underscores with a single underscore
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${sanitizedBaseName}_${uniqueSuffix}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 5 * 1024 * 1024,
              files: 5
            }, //5MB maximum file size
    fileFilter: function (req, file, cb) {
      const fileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      const extTypes = ["jpeg", "jpg", "png", "gif"];
        const mimetype = fileTypes.includes(file.mimetype);
        const extname = extTypes.includes((path.extname(file.originalname).toLowerCase()).slice(1));
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File upload only supports the following filetypes - ' + fileTypes.join(', ')));
        }
    }
});

module.exports = upload;