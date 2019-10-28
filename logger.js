module.exports = function (format) {
    const regexp = /:(\W+)/g;
    return function (req, res, next) {
        const str = format.replace(regexp, (match, property) => {
            return req[property];
        });
        console.log(str);
        next();
    }
};