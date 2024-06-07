const { LecturerTerm, Lecturer, Major } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const _ = require('lodash');

exports.importLecturerTerms = async (req, res) => {
    try {
        const { termId } = req.body;

        const lecturers = await Lecturer.findAll();

        await LecturerTerm.bulkCreate(
            lecturers.map((lecturer) => ({
                term_id: termId,
                lecturer_id: lecturer.id,
            })),
        );

        const newLecturers = await Lecturer.findAll({
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'major_id'] },
            include: [
                {
                    model: Major,
                    attributes: ['id', 'name'],
                    as: 'major',
                },
            ],
            offset: 0,
            limit: 10,
        });

        let totalPage = newLecturers.length;

        totalPage = _.ceil(totalPage / _.toInteger(10));

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import Success',
            lecturers: newLecturers,
            params: {
                page: 1,
                limit: _.toInteger(10),
                totalPage,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
