const https = require('https');
const cheerio = require('cheerio');
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const target = {
    hostname: 'get.ishadowx.biz',
    path: '',
    port: 443
};

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
    // {...target, path: '/' + url}
    return Jimp.read('https://get.ishadowx.biz' + '/' + url).then(image => {
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
        // https.get({...target, path: '/' + url}, (req, res) => {
        //     if (index > 0) {
        //         return
        //     }
        //     let imgData = '';
        //     req.setEncoding('binary');
        //     req.on('data', function (chunk) {
        //         imgData += chunk
        //     });
        //     req.on('end', function () {
        //         readImageQrCode(imgData);
        //     });
        // });
    });
    return Promise.all(promiseArr);
}

module.exports.getData = (cb) => {
    https.get(target, res => {
        let html = '';
        res.setEncoding('utf-8');
        res.on('data', chunk => {
            html += chunk;
        });
        res.on('end', () => {
            let result = [];
            let images = [];
            const $ = cheerio.load(html);
            $('[data-clipboard-text^="vmess://"]').each((index, item) => {
                const $item = $(item);
                const name = $item.attr('id');
                const url = $item.data('clipboard-text').replace('\n', '');
                result.push({name, url});
            });
            $('.hover-text a[data-lightbox-gallery]').each((index, item) => {
                const src = $(item).attr('href');
                images.push(src)
            });
            getImages(images).then(data => {
                cb(result, data);
            });
        })
    }).on('error', err => console.log(err));
};
