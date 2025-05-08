const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Serve static files (index.html and dashboard.html)
app.use(express.static(path.join(__dirname, '/')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve dashboard.html for the /dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Store orders in memory (for simplicity, no database)
let orders = [];

// Socket.IO for real-time order updates
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle new orders
    socket.on('newOrder', (order) => {
        orders.push(order);
        io.emit('newOrder', order);
        // Immediately update status to "In Process"
        const updatedOrder = { ...order, status: 'In Process' };
        orders = orders.map(o => o.id === order.id ? updatedOrder : o);
        io.emit('orderUpdate', updatedOrder);
    });

    // Handle order updates
    socket.on('orderUpdate', (updatedOrder) => {
        orders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        io.emit('orderUpdate', updatedOrder);
    });

    // Fetch orders for a specific customer
    socket.on('fetchOrders', (phone) => {
        const customerOrders = orders.filter(order => order.customerPhone === phone);
        socket.emit('orders', customerOrders);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});