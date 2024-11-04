exports.checkDegree = (degree) => {
    switch (degree) {
        case 'BACHELOR':
            return 'NCS';
        case 'MASTER':
            return 'ThS';
        case 'DOCTOR':
            return 'TS';
        default:
            return 'ThS';
    }
};
