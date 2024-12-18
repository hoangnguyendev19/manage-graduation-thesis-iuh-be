const moment = require('moment');

exports.checkDegree = (degree, fullName) => {
    switch (degree) {
        case 'BACHELOR':
            return 'NCS. ' + fullName;
        case 'MASTER':
            return 'ThS. ' + fullName;
        case 'DOCTOR':
            return 'TS. ' + fullName;
        case 'PROFESSOR':
            return 'PGS.TS ' + fullName;
        default:
            return 'ThS. ' + fullName;
    }
};

exports.validateDate = (startDate, endDate) => {
    const dateNow = moment();
    const start = moment(startDate);
    const end = moment(endDate);
    return dateNow.isBetween(start, end);
};
