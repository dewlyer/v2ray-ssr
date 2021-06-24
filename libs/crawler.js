const url = require('url');
const https = require('https');
const ProxyAgent = require('proxy-agent');
const cheerio = require('cheerio');
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const TIME_OUT = 20000;

let proxyOptions = {
    protocol: 'socks:',
    hostname: '127.0.0.1',
    port: '1086',
};

process.argv.slice(2).forEach(argv => {
    const [key, value] = argv.split('=');
    switch (key) {
        case 'protocol':
            proxyOptions.protocol = value;
            break;
        case 'url':
            proxyOptions.hostname = value;
            break;
        case 'port':
            proxyOptions.port = value;
            break;
    }
});

const targetList = [
    {
        url: 'https://view.freev2ray.org/',
        rule: '.actions a[data-lightbox]'
    },
    {
        url: 'https://get.freeshadowsocks.org/',
        rule: '.portfolio-item a.lightbox'
    },
    {
        url: 'https://io.freess.info/',
        rule: '.4u a.image',
        dataImage: true
    },
    {
        url: 'https://my.ishadowx.biz/',
        rule: '.hover-text a[data-lightbox-gallery]',
    }
];

// console.log(url.parse('socks://127.0.0.1:1081'))
// SOCKS proxy to connect to
// process.env.socks_proxy = 'socks://127.0.0.1:1081';
let agent = null;
if (process.env.proxy) {
    console.log('Proxy: %s', url.format(proxyOptions));
    agent = new ProxyAgent(proxyOptions);
}

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

function readImageQrCode(url, agent) {
    // console.log('readImageQrCode');
    return new Promise((resolve, reject) => {
        let timer = null;
        if(url.indexOf('base64') !== -1) {
            url = Buffer.from(url.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        }
        let options = !agent ? url : {url, agent};
        Jimp.read(options).then(image => {
            clearTimeout(timer);
            timer = null;
            return parseQrCode(image);
        }).then(result => {
            resolve(result);
        }).catch(err => {
            if (err) {
                clearTimeout(timer);
                timer = null;
                console.error('readImageQrCode:' + err);
                // TODO handle error
            }
        });

        timer = setTimeout(() => {
            console.log('read Image Qr Code Timeout');
            resolve('timeout')
        }, TIME_OUT);
    });
}

function getImages(urls, agent) {
    // console.log('get images start');
    let promiseArr = [];
    urls.forEach(url => {
        promiseArr.push(readImageQrCode(url, agent));
    });
    // console.log('get images end');
    return Promise.all(promiseArr);
}

module.exports.getData = (cb, proxy) => {
    let promiseList = [];
    targetList.forEach(item => {
        const target = url.parse(item.url);
        if (proxy && agent) {
            target.agent = agent;
        }
        const promise = new Promise((resolve, reject) => {
            // console.log('page get start', target.hostname);
            let timer = null;
            https.get(target, res => {
                clearTimeout(timer);
                timer = null;
                console.log('Page Get Success', target.hostname);
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
                        if (!item.dataImage && src.indexOf('http') === -1) {
                            src = item.url + src;
                        }
                        images.push(src.trim());
                    });

                    console.log('QrCode Image List \n', images);
                    getImages(images, target.agent).then(result => {
                        const resolveResult = {
                            name: target.hostname,
                            result
                        };
                        console.log('QrCode Result List \n', resolveResult);
                        resolve(resolveResult);
                    }).catch(err => {
                        console.log(err);
                        reject(err);
                    });
                })
            }).on('error', err => {
                clearTimeout(timer);
                timer = null;
                console.log(err);
                reject(err);
            });
            timer = setTimeout(() => {
                console.log('Page Get Timeout', target.hostname);
                resolve({
                    name: target.hostname,
                    result: []
                })
            }, TIME_OUT);
        });
        promiseList.push(promise)
    });

    Promise.all(promiseList).then(data => {
        console.log('All Done');
        cb(data);
    }).catch(err => {
        console.log(err);
    });

};
