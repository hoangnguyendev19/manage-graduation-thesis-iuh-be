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
