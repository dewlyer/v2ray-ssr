const https = require('https');
const cheerio = require('cheerio');
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');

const targetList = [
    {
        url: 'https://get.ishadowx.biz/',
        rule: '.hover-text a[data-lightbox-gallery]',
        target:  {
            hostname: 'get.ishadowx.biz',
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
        url: 'https://view.freev2ray.org/',
        rule: '.actions a[data-lightbox]',
        target:  {
            hostname: 'view.freev2ray.org',
            path: '',
            port: 443
        }
    }
];

function parseQrCode(image) {
    return new Promise((resolve, reject) => {
        let qr = new QrCode();
        qr.callback = (err, value) => {
            if (!err) {
                if (value && value.result) {
                    resolve(value.result);
                } else {
                    console.error('parseQrCode:', value);
                    resolve('empty');
                }
            } else {
                console.error('parseQrCode:', image, err);
                resolve('false');
            }
        };
        qr.decode(image.bitmap);
    });
}

function readImageQrCode(url) {
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
    let promiseArr = [];
    urls.forEach(url => {
        promiseArr.push(readImageQrCode(url));
    });
    return Promise.all(promiseArr);
}

module.exports.getData = (cb) => {
    let promiseList = [];
    targetList.forEach(item => {
        const promise = new Promise((resolve, reject) => {
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
                            src = item.url + src
                            console.log(src)
                        }
                        images.push(src);
                    });

                    resolve(getImages(images))
                })
            }).on('error', err => console.log(err));
        });
        promiseList.push(promise)
    });

    Promise.all(promiseList).then(data => {
        cb(data);
    });

};
