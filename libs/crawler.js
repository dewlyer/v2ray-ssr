const https = require('https');
const cheerio = require('cheerio');
const target = {
    hostname: 'get.ishadowx.biz',
    path: '',
    port: 443
};

module.exports.getData = (cb) => {
    https.get(target, res => {
        let html = '';
        res.setEncoding('utf-8');
        res.on('data', chunk => {
            html += chunk;
        });
        res.on('end', () => {
            let result = [];
            const $ = cheerio.load(html);
            $('[data-clipboard-text^="vmess://"]').each((index, item) => {
                const $item = $(item);
                const name = $item.attr('id');
                const url = $item.data('clipboard-text').replace('\n', '');
                result.push({name, url});
            });
            cb(result);
        })
    }).on('error', err => console.log(err));
};
