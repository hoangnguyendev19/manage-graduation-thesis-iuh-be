const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return Error.sendBadRequest(res, 'No file uploaded!');
        }
        console.log(req.file);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Upload file successfully',
            path: req.file.path,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
