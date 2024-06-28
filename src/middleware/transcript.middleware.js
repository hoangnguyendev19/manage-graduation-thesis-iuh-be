const { Transcript, StudentTerm } = require('../models');
const Error = require('../helper/errors');

const isExistTranscript = async (req, res, next) => {
    try {
        const { termId, studentId, evaluationId } = req.body;

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: studentId,
            },
        });
        const transcript = await Transcript.findOne({
            attributes: ['id'],
            where: {
                student_term_id: studentTerm,
                evaluation: evaluationId,
            },
        });
        if (transcript) {
            return Error.sendConflict(res, 'Bảng điểm này đã tồn tại');
        } else next();
    } catch (error) {
        console.log('🚀 ~ isExistTranscript ~ error:', error);
        Error.sendError(res, error);
    }
};
module.exports = {
    isExistTranscript,
};
