const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const axios = require('axios');
const FormData = require('form-data');

exports.checkPlagiarism = async (req, res) => {
    // Ensure the file is properly uploaded
    if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No file uploaded.',
        });
    }

    // File size validation (optional)
    if (req.file.size > 10 * 1024 * 1024) {
        // 10 MB limit
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'File size exceeds the 10MB limit.',
        });
    }

    // Create form data object
    const form = new FormData();

    // Append the file buffer (remember req.file.buffer is the actual file data)
    form.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype, // Set correct mime type
    });

    try {
        // Send file to Python API for plagiarism checking
        const response = await axios.post(
            process.env.PYTHON_SERVER_URL + '/api/v1/check-plagiarism',
            form, // Send the form data
            {
                headers: {
                    ...form.getHeaders(), // Ensure correct headers for form data
                },
            },
        );

        res.status(200).json({
            success: true,
            message: 'Plagiarism check successful',
            data: response.data,
        });
    } catch (error) {
        console.error(error);

        // Handle specific errors from axios
        if (error.response) {
            res.status(error.response.status).json({
                success: false,
                message: error.response.data.message || 'Error from Python server',
            });
        } else if (error.request) {
            res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
                success: false,
                message: 'No response from the Python server. Please try again later.',
            });
        } else {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error in processing the request',
            });
        }
    }
};
