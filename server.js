const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.get('/', (req, res) => {
  res.send('QR Menu Order Server');
});

io.on('connection', (socket) => {
  const shopId = socket.handshake.query.shopId;
  console.log(`Client connected for shop: ${shopId}`);

  socket.join(shopId);

  socket.on('newOrder', (order) => {
    if (order.shopId === shopId) {
      io.to(shopId).emit('newOrder', order);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected from shop: ${shopId}`);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});