const multer = require('multer');

// Set storage engine for Multer
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'public/uploads'); // Files will be saved in 'public/uploads' folder
    },
    filename: (_, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/zip' ||
        file.mimetype === 'application/vnd.rar'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, ZIP, RAR files are allowed!'), false);
    }
};

const upload = multer({ storage, limits: { fileSize: 30 * 1024 * 1024 }, fileFilter });

module.exports = upload;
