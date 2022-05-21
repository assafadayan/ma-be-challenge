const fs = require('fs');
const http = require('http');

const port = +process.argv[2] || 3000;
const offset = port % 2;

const OK = 200;
const READY = Buffer.from('{"ready":true}', 'ascii');
const ALL_CARDS = Buffer.from('{"id": "ALL CARDS"}', 'ascii');

const cardsData = fs.readFileSync('./cards.json');
const parsedCards = JSON.parse(cardsData);
const cards = [...parsedCards.map(c => Buffer.from(JSON.stringify(c)), "ascii")];  // JSON strings in array
const done = {};

const listener = async function(req, res) {
    res.writeHead(OK);
    if (req.url !== '/ready') {
        const key = req.url.substring(13); // '/card_app?id='
        let index = done[key];
        if (index === undefined) {
            index = offset;
        } else if (index >= cards.length) {
            res.end(ALL_CARDS);
            return;
        }
        done[key] = index + 2;
        res.end(cards[index]);
        return;
    }
    res.end(READY);
}

const server = http.createServer(listener);
server.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://0.0.0.0:${port}`);
});
