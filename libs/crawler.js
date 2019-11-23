const https = require('https');
const cheerio = require('cheerio');
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');

const targetList = [
  {
    url: 'https://view.freev2ray.org/',
    rule: '.actions a[data-lightbox]',
    target:  {
      hostname: 'view.freev2ray.org',
      path: '',
      port: 443
    }
  },
  {
        url: 'https://en.ss8.tech/',
        rule: '.carousel a.image',
        target:  {
            hostname: 'en.ss8.tech',
            path: '',
            port: 443
        }
    },
  {
        url: 'https://get.ishadowx.biz/',
        rule: '.hover-text a[data-lightbox-gallery]',
        target:  {
            hostname: 'get.ishadowx.biz',
            path: '',
            port: 443
        }
    }
];

function parseQrCode(image) {
    // console.log('parseQrCode');
    return new Promise((resolve, reject) => {
        // console.log('QrCode Decode');
        const qrCode = new QrCode();
        qrCode.callback = (err, value) => {
            // console.log('QrCode Decode CallBack');
            if (!err) {
                console.log('QrCode Decode Success');
                if (value && value.result) {
                    resolve(value.result);
                } else {
                    console.error('parseQrCode:', value);
                    resolve('empty');
                }
            } else {
                console.log('QrCode Decode Failure');
                console.error('parseQrCode:', image, err);
                resolve('false');
            }
            // console.log('QrCode Decode CallBack End');
        };
        qrCode.decode(image.bitmap);
    });
}

function readImageQrCode(url) {
    // console.log('readImageQrCode');
    return Jimp.read(url).then(image => {
        return parseQrCode(image)
    }).catch(err => {
        if (err) {
            console.error('readImageQrCode:' + err);
            // TODO handle error
        }
    });
}

function getImages(urls) {
    // console.log('get images start');
    let promiseArr = [];
    urls.forEach(url => {
        promiseArr.push(readImageQrCode(url));
    });
    // console.log('get images end');
    return Promise.all(promiseArr);
}

module.exports.getData = (cb) => {
    let promiseList = [];
    targetList.forEach(item => {
        const promise = new Promise((resolve, reject) => {
            // console.log('start https get url');
            https.get(item.target, res => {
                let html = '';
                res.setEncoding('utf-8');
                res.on('data', chunk => {
                    html += chunk;
                });
                res.on('end', () => {
                    let result = [];
                    let images = [];
                    const $ = cheerio.load(html);

                    // $('[data-clipboard-text^="vmess://"]').each((index, item) => {
                    //     const $item = $(item);
                    //     const name = $item.attr('id');
                    //     const url = $item.data('clipboard-text').replace('\n', '');
                    //     result.push({name, url});
                    // });

                    // if (result.length) {
                    //     promiseList.push(Promise.resolve(result))
                    // }

                    $(item.rule).each((index, image) => {
                        let src = $(image).attr('href');
                        if (src.indexOf('http') === -1) {
                            src = item.url + src;
                        }
                        images.push(src.trim());
                    });

                    console.log('QrCode Image List', images);
                    getImages(images).then(result => {
                        console.log('QrCode Result List', result);
                        resolve(result)
                    }).catch(err => {
                        console.log(err);
                        reject(err);
                    });
                })
            }).on('error', err => {
                console.log(err);
                reject(err);
            });
        });
        promiseList.push(promise)
    });

    Promise.all(promiseList).then(data => {
        console.log('All Done');
        cb(data);
    });

};
