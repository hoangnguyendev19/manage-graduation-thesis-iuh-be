const { validationResult } = require('express-validator')

exports.validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            status: 400,
            message: errors.array()[0].msg,
        })
    }
    next()
}
