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
            const $ = cheerio.load(html);
            const links = Array.prototype.map.call($('[data-clipboard-text^="vmess://"]'), item => {
                return $(item).data('clipboard-text').replace('\n', '');
            });
            cb(links);
        })
    }).on('error', err => console.log(err));
};
