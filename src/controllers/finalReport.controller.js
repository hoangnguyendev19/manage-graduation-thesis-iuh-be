const { FinalReport, Term, GroupStudent } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/mysql.config');
const fs = require('fs');
const logger = require('../configs/logger.config');

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
        logger.error(error);
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
        logger.error(error);
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
            `SELECT fr.id, fr.link, fr.comment
            FROM final_reports fr
            INNER JOIN group_students gs ON fr.group_student_id = gs.id
            INNER JOIN student_terms st ON st.group_student_id = gs.id
            WHERE st.term_id = :termId AND st.student_id = :studentId`,
            {
                replacements: { termId, studentId: req.user.id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (finalReport.length === 0) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không có báo cáo cuối kỳ!');
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy báo cáo cuối kỳ thành công!',
            finalReport: finalReport[0],
        });
    } catch (error) {
        logger.error(error);
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

        const groupStudent = await sequelize.query(
            `SELECT gs.id, gs.name, t.name as termName
            FROM group_students gs
            INNER JOIN terms t ON gs.term_id = t.id
            WHERE gs.id = :groupStudentId`,
            {
                replacements: { groupStudentId },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (groupStudent.length === 0) {
            fs.unlinkSync(req.file.path); // Delete the file
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        const fileName =
            groupStudent[0].termName +
            '_KLTN_NHOM_' +
            groupStudent[0].name +
            '_' +
            Date.now() +
            '.pdf';
        const filePath = `/uploads/${fileName}`; // Relative path to `public` folder

        // Rename the file after it is saved
        fs.rename(req.file.path, `public${filePath}`, (err) => {
            if (err) {
                fs.unlinkSync(req.file.path); // Delete the file
                logger.error(`Error renaming file: ${err}`);
                return Error.sendError(res, err);
            }
        });

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
        fs.unlinkSync(req.file.path); // Delete the file
        logger.error(error);
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

        const finalReport = await sequelize.query(
            `SELECT fr.id, fr.link, gs.name, t.name as termName
            FROM final_reports fr
            INNER JOIN group_students gs ON fr.group_student_id = gs.id
            INNER JOIN terms t ON gs.term_id = t.id
            WHERE fr.id = :id`,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (finalReport.length === 0) {
            fs.unlinkSync(req.file.path); // Delete the file
            return Error.sendNotFound(res, 'Báo cáo cuối kỳ không tồn tại!');
        }

        // Delete old file
        const oldFilePath = finalReport[0].link;
        fs.unlinkSync(`public${oldFilePath}`);

        const fileName =
            finalReport[0].termName +
            '_KLTN_NHOM_' +
            finalReport[0].name +
            '_' +
            Date.now() +
            '.pdf';
        const filePath = `/uploads/${fileName}`; // Relative path to `public` folder

        // Rename the file after it is saved
        fs.rename(req.file.path, `public${filePath}`, (err) => {
            if (err) {
                fs.unlinkSync(req.file.path); // Delete the file
                logger.error(`Error renaming file: ${err}`);
                return Error.sendError(res, err);
            }
        });

        await FinalReport.update(
            {
                link: filePath,
            },
            {
                where: { id },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật báo cáo cuối kỳ thành công!',
        });
    } catch (error) {
        fs.unlinkSync(req.file.path); // Delete the file
        logger.error(error);
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
        logger.error(error);
        Error.sendError(res, error);
    }
};
