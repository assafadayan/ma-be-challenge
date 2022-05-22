const fs = require('fs');
const fastify = require('fastify');
const app = fastify();
const port = +process.argv[2] || 3000;

const READY = Buffer.from('{"ready":true}', 'ascii');
const ALL_CARDS = Buffer.from('{"id": "ALL CARDS"}', 'ascii');

const cardsData = fs.readFileSync('./cards.json');
const parsedCards = JSON.parse(cardsData);
const cards = [...parsedCards.map(c => Buffer.from(JSON.stringify(c)), "ascii")];  // JSON strings in array
const done = {};

const client = require('redis').createClient();
client.on('error', (err) => console.log('Redis Client Error', err));
client.on('ready', () => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Example app listening at http://0.0.0.0:${port}`);
    });
});

app.get('/card_add', async (req, res) => {
    const key = req.query.id;
    if (!done[key]) {
        const index = await client.incr(key) - 1;
        if (index < cards.length) {
            res.send(cards[index]);
            return;
        }
        done[key] = 1;
    }
    res.send(ALL_CARDS);
});

app.get('/ready', async (req, res) => {
    res.send(READY);
});

client.connect();