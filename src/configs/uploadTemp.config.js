const multer = require('multer');

// Set storage engine for Multer
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'public/temp'); // Files will be saved in 'public/temp' folder
    },
    filename: (_, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });

module.exports = upload;
