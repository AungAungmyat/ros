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

// Socket.IO for real-time order updates
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('newOrder', (order) => {
        io.emit('newOrder', order);
        io.emit('orderUpdate', { ...order, status: 'In Process' });
    });

    socket.on('orderUpdate', (updatedOrder) => {
        io.emit('orderUpdate', updatedOrder);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});