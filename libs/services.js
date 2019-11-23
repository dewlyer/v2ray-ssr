const crawler = require('../libs/crawler');

function updateSourceData(cb) {
    console.log('source sync begin ==> ' + new Date().toLocaleString());
    crawler.getData((all) => {
        let list = [];
        all.forEach(({name, result}) => {
            list = list.concat(result.map((item, index) => {
                const id = String(index + 1).padStart(3, '0');
                return {
                    name: `${name}_${id}`,
                    url: item || ''
                }
            }));
            // list.sort((a, b) => (a.name.slice(-3) - b.name.slice(-3)));
        });
        cb && cb(list)
    });
}

module.exports = {
    updateSourceData
};
