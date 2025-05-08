const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

let orders = []; // Order တွေကို သိမ်းဖို့ Array

io.on('connection', (socket) => {
  console.log('A client connected');

  // အော်ဒါအသစ်တင်တဲ့ Event
  socket.on('newOrder', (order) => {
    orders.push(order);
    io.emit('newOrder', order); // Menu နဲ့ Dashboard ကို ပို့ပေးမယ်
  });

  // အော်ဒါတွေကို Customer အလိုက် ပြန်ယူတဲ့ Event
  socket.on('fetchOrdersByCustomer', (phoneNumber) => {
    const customerOrders = orders.filter(order => order.customerPhone === phoneNumber);
    socket.emit('ordersByCustomer', customerOrders);
  });

  // အော်ဒါတွေအားလုံးကို ပြန်ယူတဲ့ Event (Dashboard အတွက်)
  socket.on('fetchOrders', () => {
    socket.emit('orders', orders);
  });

  // Status ပြောင်းတဲ့ Event
  socket.on('updateOrderStatus', ({ orderId, status }) => {
    if (status === 'Rejected') {
      orders = orders.filter((_, index) => index !== orderId);
    } else {
      orders[orderId].status = status;
    }
    io.emit('updateOrderStatus', { orderId, status });
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});