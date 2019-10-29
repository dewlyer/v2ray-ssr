const crawler = require('../libs/crawler');

function updateSourceData(cb) {
    console.log('source sync begin ==> ' + new Date().toLocaleString());
    crawler.getData(data => cb && cb(data));
}

module.exports = {
    updateSourceData
};
