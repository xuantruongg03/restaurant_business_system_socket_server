const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const wss = new WebSocket.Server({ port: 1234 });
const port = 3000;
const momopayment = require('./momo.js');

app.use(bodyParser.json());

let clients = {};

// Kết nối WebSocket
wss.on('connection', (ws, req) => {
  const clientId = req.url.split('?id=')[1];
  clients[clientId] = ws;
  console.log(`Client ${clientId} connected`);

  ws.on('message', message => {
    console.log(`Received message from client ${clientId} => ${message}`);
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    delete clients[clientId];
  });
});

// API để gửi thông điệp đến client
app.post('/api/v1/socket/send-message', (req, res) => {
  const clientId = req.body.clientId;
  const message = req.body.message;
  console.log(`Sending message to client ${clientId} => ${message}`);

  if (clients[clientId] && clients[clientId].readyState === WebSocket.OPEN) {
    clients[clientId].send(message);
    res.status(200).send(`Message sent to client ${clientId}`);
  } else {
    res.status(404).send(`Client ${clientId} not connected`);
  }
});

app.post('/api/v1/momo/payment-request', async (req, res) => {
  const price = req.body.price;
  const partnerCode = req.body.partnerCode;
  const desUrl = req.body.desUrl;
  const des = req.body.des;
  const acc = req.body.accessKey;
  const scr = req.body.secretKey;
  // console.log(partnerCode, desUrl, des, acc, scr);

  const urlpay = await momopayment(price, partnerCode, desUrl, des, acc, scr);
  // console.log("URLPAY: ", urlpay);
  res.status(200).send(urlpay);
});

app.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});