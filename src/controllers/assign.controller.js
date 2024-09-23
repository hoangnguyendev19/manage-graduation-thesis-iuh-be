const { Assign, GroupLecturer, Term, GroupStudent } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const checkTypeGroup = (value) => {
    switch (value) {
        case 'REVIEWER':
            return 'Nhóm chấm phản biện';
        case 'REPORT_POSTER':
            return 'Nhóm chấm poster ';
        case 'REPORT_COUNCIL':
            return 'Nhóm chấm hội đồng';
    }
};

exports.exportAssigns = async (req, res) => {
    try {
        const { termId, type } = req.query;

        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kỳ!');
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        let assigns = [];

        // column: STT Nhóm, Mã SV, Họ tên SV, GVHD, #HĐPB, HD TV, Thư ký, Ghi chú
        if (type === 'reviewer') {
            assigns = await sequelize.query(
                `SELECT gs.id, gs.name as 'STT Nhóm', s.username as 'Mã SV', s.full_name as 'Họ tên SV', gl.name as '#HĐPB', a.type as 'Ghi chú', GROUP_CONCAT(l.full_name SEPARATOR ', ') as 'HD TV'
                FROM assigns a
                INNER JOIN group_students gs ON a.group_student_id = gs.id
                INNER JOIN student_terms st ON st.group_student_id = gs.id
                INNER JOIN students s ON st.student_id = s.id
                INNER JOIN group_lecturers gl ON a.group_lecturer_id = gl.id
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE lt.term_id = :termId AND a.type = 'REVIEWER'
                GROUP BY gs.id, gs.name, s.username, s.full_name, gl.name, a.type`,
                {
                    replacements: { termId },
                    type: QueryTypes.SELECT,
                },
            );
        } else if (type === 'report') {
            assigns = await sequelize.query(
                `SELECT gs.id, gs.name as 'STT Nhóm', s.username as 'Mã SV', s.full_name as 'Họ tên SV', gl.name as '#HĐPB', a.type as 'Ghi chú', GROUP_CONCAT(l.full_name SEPARATOR ', ') as 'HD TV'
                FROM assigns a
                INNER JOIN group_students gs ON a.group_student_id = gs.id
                INNER JOIN student_terms st ON st.group_student_id = gs.id
                INNER JOIN students s ON st.student_id = s.id
                INNER JOIN group_lecturers gl ON a.group_lecturer_id = gl.id
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE lt.term_id = :termId AND NOT a.type = 'REVIEWER'
                GROUP BY gs.id, gs.name, s.username, s.full_name, gl.name, a.type`,
                {
                    replacements: { termId },
                    type: QueryTypes.SELECT,
                },
            );
        }

        for (let i = 0; i < assigns.length; i++) {
            assigns[i]['STT'] = i + 1;

            if (assigns[i]['Ghi chú'] === 'REVIEWER') {
                assigns[i]['Ghi chú'] = 'Hội đồng phản biện';
            } else if (assigns[i]['Ghi chú'] === 'REPORT_POSTER') {
                assigns[i]['Ghi chú'] = 'Hội đồng poster';
            } else if (assigns[i]['Ghi chú'] === 'REPORT_COUNCIL') {
                assigns[i]['Ghi chú'] = 'Hội đồng báo cáo';
            }

            const lecturerSupport = await sequelize.query(
                `SELECT l.full_name as fullName 
                FROM group_students gs
                INNER JOIN topics t ON gs.topic_id = t.id
                INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE gs.id = :groupStudentId`,
                {
                    replacements: { groupStudentId: assigns[i].id },
                    type: QueryTypes.SELECT,
                },
            );

            assigns[i]['GVHD'] = lecturerSupport[0].fullName;

            delete assigns[i].id;

            assigns[i]['HD TV'] = assigns[i]['HD TV'].split(', ');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách phân công thành công!',
            assigns,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

exports.exportAssignsByLecturerId = async (req, res) => {
    try {
        const { termId, type } = req.query;

        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kỳ!');
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        let assigns = [];

        // column: STT Nhóm, Mã SV, Họ tên SV, GVHD, #HĐPB, HD TV, Thư ký, Ghi chú
        if (type === 'reviewer') {
            assigns = await sequelize.query(
                `SELECT gs.id, gs.name as 'STT Nhóm', s.username as 'Mã SV', s.full_name as 'Họ tên SV', gl.name as '#HĐPB', a.type as 'Ghi chú', GROUP_CONCAT(l.full_name SEPARATOR ', ') as 'HD TV'
                FROM assigns a
                INNER JOIN group_students gs ON a.group_student_id = gs.id
                INNER JOIN student_terms st ON st.group_student_id = gs.id
                INNER JOIN students s ON st.student_id = s.id
                INNER JOIN group_lecturers gl ON a.group_lecturer_id = gl.id
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE lt.term_id = :termId AND a.type = 'REVIEWER'
                GROUP BY gs.id, gs.name, s.username, s.full_name, gl.name, a.type`,
                {
                    replacements: { termId },
                    type: QueryTypes.SELECT,
                },
            );
        } else if (type === 'report') {
            assigns = await sequelize.query(
                `SELECT gs.id, gs.name as 'STT Nhóm', s.username as 'Mã SV', s.full_name as 'Họ tên SV', gl.name as '#HĐPB', a.type as 'Ghi chú', GROUP_CONCAT(l.full_name SEPARATOR ', ') as 'HD TV'
                FROM assigns a
                INNER JOIN group_students gs ON a.group_student_id = gs.id
                INNER JOIN student_terms st ON st.group_student_id = gs.id
                INNER JOIN students s ON st.student_id = s.id
                INNER JOIN group_lecturers gl ON a.group_lecturer_id = gl.id
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE lt.term_id = :termId AND NOT a.type = 'REVIEWER'
                GROUP BY gs.id, gs.name, s.username, s.full_name, gl.name, a.type`,
                {
                    replacements: { termId },
                    type: QueryTypes.SELECT,
                },
            );
        }

        assigns = assigns.filter((assign) => assign['HD TV'].includes(req.user.fullName));

        for (let i = 0; i < assigns.length; i++) {
            assigns[i]['STT'] = i + 1;

            if (assigns[i]['Ghi chú'] === 'REVIEWER') {
                assigns[i]['Ghi chú'] = 'Hội đồng phản biện';
            } else if (assigns[i]['Ghi chú'] === 'REPORT_POSTER') {
                assigns[i]['Ghi chú'] = 'Hội đồng poster';
            } else if (assigns[i]['Ghi chú'] === 'REPORT_COUNCIL') {
                assigns[i]['Ghi chú'] = 'Hội đồng báo cáo';
            }

            const lecturerSupport = await sequelize.query(
                `SELECT l.full_name as fullName 
                FROM group_students gs
                INNER JOIN topics t ON gs.topic_id = t.id
                INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE gs.id = :groupStudentId`,
                {
                    replacements: { groupStudentId: assigns[i].id },
                    type: QueryTypes.SELECT,
                },
            );

            assigns[i]['GVHD'] = lecturerSupport[0].fullName;

            delete assigns[i].id;

            assigns[i]['HD TV'] = assigns[i]['HD TV'].split(', ');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách phân công thành công!',
            assigns,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

exports.createAssign = async (req, res) => {
    try {
        const { groupLecturerId, listGroupStudentId, type } = req.body;

        const groupLecturer = await GroupLecturer.findByPk(groupLecturerId, {
            attributes: ['id', 'name', 'type'],
        });

        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Không tồn tại nhóm giảng viên này');
        }

        if (groupLecturer.type !== type.toUpperCase()) {
            return Error.sendConflict(
                res,
                `Nhóm giảng viên ${groupLecturer.name} không phải là ${checkTypeGroup(
                    type.toUpperCase(),
                )}`,
            );
        }

        for (let i = 0; i < listGroupStudentId.length; i++) {
            const isExistAssign = await Assign.findOne({
                where: {
                    type: type.toUpperCase(),
                    group_student_id: listGroupStudentId[i],
                },
            });

            const groupStudent = await GroupStudent.findByPk(listGroupStudentId[i], {
                attributes: ['id', 'name'],
            });

            if (isExistAssign) {
                return Error.sendConflict(
                    res,
                    `Nhóm sinh viên ${groupStudent.name} đã được phân công chấm điểm`,
                );
            }

            const isExistLecturerSupportInGroupLecturer = await sequelize.query(
                `SELECT l.full_name as fullName 
                FROM group_lecturer_members glm
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN topics t ON lt.id = t.lecturer_term_id
                INNER JOIN group_students gs ON t.id = gs.topic_id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE glm.group_lecturer_id = :groupLecturerId AND gs.id = :groupStudentId`,
                {
                    replacements: {
                        groupLecturerId,
                        groupStudentId: listGroupStudentId[i],
                    },
                    type: QueryTypes.SELECT,
                },
            );

            if (isExistLecturerSupportInGroupLecturer.length > 0) {
                return Error.sendConflict(
                    res,
                    `Giảng viên ${
                        isExistLecturerSupportInGroupLecturer[0].fullName
                    } là giảng viên hướng dẫn của Nhóm sinh viên ${
                        groupStudent.name
                    } nên không được phân ${checkTypeGroup(type.toUpperCase())}`,
                );
            }

            await Assign.create({
                group_lecturer_id: groupLecturerId,
                group_student_id: listGroupStudentId[i],
                type: type.toUpperCase(),
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Phân công ${groupLecturer.name} chấm điểm nhóm sinh viên thành công!`,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

exports.updateAssign = async (req, res) => {
    try {
        const { groupLecturerId, listGroupStudentId, type } = req.body;

        const groupLecturer = await GroupLecturer.findByPk(groupLecturerId, {
            attributes: ['id', 'name'],
        });

        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Không tồn tại nhóm giảng viên này');
        }

        const assigns = await Assign.findAll({
            where: {
                group_lecturer_id: groupLecturerId,
                type: type.toUpperCase(),
            },
        });

        for (let i = 0; i < assigns.length; i++) {
            if (!listGroupStudentId.includes(assigns[i].group_student_id)) {
                await assigns[i].destroy();
            } else {
                listGroupStudentId.splice(
                    listGroupStudentId.indexOf(assigns[i].group_student_id),
                    1,
                );
            }
        }

        if (listGroupStudentId.length > 0) {
            for (let i = 0; i < listGroupStudentId.length; i++) {
                await Assign.create({
                    group_lecturer_id: groupLecturerId,
                    group_student_id: listGroupStudentId[i],
                    type: type.toUpperCase(),
                });
            }
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Cập nhật phân công ${groupLecturer.name} chấm điểm nhóm sinh viên thành công`,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

exports.deleteAssign = async (req, res) => {
    try {
        const { id, type } = req.params;

        const groupLecturer = await GroupLecturer.findByPk(id, {
            attributes: ['id', 'name'],
        });

        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Không tồn tại nhóm giảng viên này');
        }

        const assigns = await Assign.findAll({
            where: {
                group_lecturer_id: id,
                type: type.toUpperCase(),
            },
        });

        for (let i = 0; i < assigns.length; i++) {
            await assigns[i].destroy();
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Xóa phân công ${groupLecturer.name} chấm điểm nhóm sinh viên thành công`,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

exports.getGroupStudentNoAssign = async (req, res) => {
    try {
        const { type } = req.params;
        const { termId } = req.query;

        const assigns = await Assign.findAll({
            attributes: ['group_student_id'],
            where: {
                type: type.toUpperCase(),
            },
        });

        const myNotIn = assigns.map((ass) => `'${ass.group_student_id}'`);

        const notInCondition = myNotIn.length > 0 ? `AND gs.id NOT IN (${myNotIn.join(',')})` : '';

        const resultGroupStudent = await sequelize.query(
            `SELECT gs.id, gs.name, t.name AS topicName, l.full_name AS lecturerName, lt.lecturer_id AS lecturerId, lt.id AS lecturerTermId
            FROM group_students gs
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE gs.term_id = :termId ${notInCondition}`,
            {
                replacements: { termId },
                type: QueryTypes.SELECT,
            },
        );

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách sinh viên chưa chấm thành công',
            groupStudent: resultGroupStudent,
        });
    } catch (error) {
        console.error(error);
        return Error.sendError(res, error);
    }
};
