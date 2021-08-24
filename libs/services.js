const crawler = require('../libs/crawler');

function updateSourceCallback(all, cb) {
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
}

function updateSourceData(cb) {
  console.log('source sync begin ==> ' + new Date().toLocaleString());
  crawler.getData((all) => updateSourceCallback(all, cb));
}

function updateSourceDataWithProxy(cb) {
  console.log('source sync with proxy begin ==> ' + new Date().toLocaleString());
  crawler.getData((all) => updateSourceCallback(all, cb), true);
}

module.exports = {
  updateSourceData,
  updateSourceDataWithProxy
};
