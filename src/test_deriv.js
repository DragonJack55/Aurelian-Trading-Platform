const WebSocket = require('ws');
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

ws.on('open', function open() {
  console.log('connected');
  ws.send(JSON.stringify({
    ticks: 'frxEURUSD'
  }));
});

ws.on('message', function incoming(data) {
  console.log(data.toString());
  process.exit();
});

ws.on('error', function error(err) {
  console.error(err);
  process.exit(1);
});
