const { FinalReport, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');
const fs = require('fs');

exports.getFinalReports = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const finalReports = await sequelize.query(
            `SELECT fr.id, fr.link, fr.comment, gs.name, t.name as topicName, l.full_name as lecturerName
            FROM final_reports fr
            INNER JOIN group_students gs ON fr.group_student_id = gs.id
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE gs.term_id = :termId`,
            {
                replacements: { termId },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách báo cáo cuối kỳ thành công!',
            finalReports,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getFinalReportsByLecturerId = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const finalReports = await sequelize.query(
            `SELECT fr.id, fr.link, fr.comment, gs.name, t.name as topicName
            FROM final_reports fr
            INNER JOIN group_students gs ON fr.group_student_id = gs.id
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId`,
            {
                replacements: { termId, lecturerId: req.user.id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách báo cáo cuối kỳ thành công!',
            finalReports,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getFinalReportByGroupStudentId = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const finalReport = await sequelize.query(
            `SELECT fr.id, fr.link, fr.comment, fr.created_at as createdAt
            FROM final_reports fr
            INNER JOIN group_students gs ON fr.group_student_id = gs.id
            INNER JOIN student_terms st ON st.group_student_id = gs.id
            WHERE st.term_id = :termId AND st.student_id = :studentId`,
            {
                replacements: { termId, studentId: req.user.id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy báo cáo cuối kỳ thành công!',
            finalReport: finalReport[0],
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createFinalReport = async (req, res) => {
    // Ensure the file is properly uploaded
    if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No file uploaded.',
        });
    }

    try {
        const { groupStudentId } = req.body;

        const fileName = req.file.filename;
        const filePath = `/uploads/${fileName}`; // Relative path to `public` folder

        const finalReport = await FinalReport.create({
            group_student_id: groupStudentId,
            link: filePath,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo báo cáo cuối kỳ thành công!',
            finalReport,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateFinalReport = async (req, res) => {
    // Ensure the file is properly uploaded
    if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No file uploaded.',
        });
    }

    try {
        const { id } = req.params;

        const finalReport = await FinalReport.findByPk(id);
        if (!finalReport) {
            return Error.sendNotFound(res, 'Báo cáo cuối kỳ không tồn tại!');
        }

        // Delete old file
        const oldFilePath = finalReport.link;
        fs.unlinkSync(`public${oldFilePath}`);

        const fileName = req.file.filename;
        const filePath = `/uploads/${fileName}`; // Relative path to `public` folder

        await finalReport.update({ link: filePath });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật báo cáo cuối kỳ thành công!',
            finalReport,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.commentFinalReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const finalReport = await FinalReport.findByPk(id);
        if (!finalReport) {
            return Error.sendNotFound(res, 'Báo cáo cuối kỳ không tồn tại!');
        }

        await finalReport.update({ comment });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Bình luận báo cáo cuối kỳ thành công!',
            finalReport,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
