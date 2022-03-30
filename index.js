const qrcode = require('qrcode-terminal')
const {
    Client
} = require('whatsapp-web.js');

const client = new Client();

const express = require('express');
const app = express()
const port = 3000

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})


client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {
        small: true
    })
});

client.on('ready', () => {
    console.log('\nClinte preparado!\n');
});

client.on('message', msg => {
    if (msg.body) {
        console.log(msg.body);
    }
});

client.initialize();

// express
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/sendMessage', urlencodedParser, function (req, res) {
    number = req.body.number;
    msg = req.body.msg;

    const chatId = number.substring(1) + "@c.us";

    res.send({
        'chatId': chatId,
        'msg': msg
    })

    client.sendMessage(chatId, msg);

})

app.listen(port, () => {
    console.log(`Aplicção rodando na porta ${port}`)
})