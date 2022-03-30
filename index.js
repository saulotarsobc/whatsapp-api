const {
    Client
} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal')
const express = require('express')
const app = express()
const port = 3000

const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {
        small: true
    })
});

client.on('ready', () => {
    console.log('Client is ready!');
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})