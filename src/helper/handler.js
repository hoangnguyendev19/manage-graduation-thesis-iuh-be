const moment = require('moment');

exports.checkDegree = (degree) => {
    switch (degree) {
        case 'BACHELOR':
            return 'NCS';
        case 'MASTER':
            return 'ThS';
        case 'DOCTOR':
            return 'TS';
        case 'PROFESSOR':
            return 'PGS. TS';
        default:
            return 'ThS';
    }
};

exports.validateDate = (startDate, endDate) => {
    const dateNow = moment();
    const start = moment(startDate);
    const end = moment(endDate);
    return dateNow.isBetween(start, end);
};
