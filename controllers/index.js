const base64 = require('js-base64').Base64;
const Servers = require('../models/db').Server;
const Services = require('../libs/services');

function updateDataBase(item) {
  return new Promise((resolve, reject) => {
    Servers.create(item, err => {
      if (err) {
        console.log('updateDataBase:', err);
        reject(err);
      } else {
        // console.log('updateDataBase:', item.name);
        resolve();
      }
    });
  });
}

function updateSourceByEachItem(list, cb, index) {
  const length = list.length;
  let current = index || 0;
  if (current < length) {
    updateDataBase(list[current]).then(() => {
      current++;
      updateSourceByEachItem(list, cb, current)
    })
  } else {
    cb();
  }
}

function updateSource(cb, proxy) {
  const callback = (list) => {
    Servers.clear(() => {
      updateSourceByEachItem(list, () => {
        console.log('source sync end ==> ' + new Date().toLocaleString());
        if (typeof cb === 'function') {
          cb();
        }
      });
      // const pList = list.map(item => updateDataBase(item));
      // Promise.all(pList).then(() => {
      //     console.log('source sync end ==> ' + new Date().toLocaleString());
      //     cb && cb();
      // });
    });
  };

  if (proxy) {
    Services.updateSourceDataWithProxy(callback)
  } else {
    Services.updateSourceData(callback)
  }
}

function getSourceRss(cb, error) {
}

function findServer(id, cb) {
  return Servers.find(id, cb);
}

function deleteServer(id, cb) {
  return Servers.delete(id, cb);
}

function getServerList(successCallback, failCallback) {
  return Servers.all((err, servers) => {
    if (err) {
      return failCallback(err);
    }
    successCallback(servers);
  });
}

function getServerRss(successCallback, failCallback) {
  return Servers.all((err, servers) => {
    if (err) {
      return failCallback(err);
    }
    const list = servers.map(item => item.url).join('\n');
    console.log('source updated result ==> add ' + servers.length + ' servers');
    successCallback(base64.encode(list))
  });
}

module.exports = {
  findServer,
  deleteServer,
  getServerList,
  getServerRss,
}
