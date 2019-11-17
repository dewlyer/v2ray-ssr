const crawler = require('../libs/crawler');

function updateSourceData(cb) {
    console.log('source sync begin ==> ' + new Date().toLocaleString());
    crawler.getData((v2ray, all) => {
        cb && cb(v2ray, all)
    });
}

module.exports = {
    updateSourceData
};
