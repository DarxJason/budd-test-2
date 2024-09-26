const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {};  // Store players' data

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Create a new player object when they connect
    players[socket.id] = {
        x: 0,
        y: 0,
        attacking: false,
        id: socket.id
    };

    // Send the new player object to other clients
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Send all existing players to the new player
    socket.emit('currentPlayers', players);

    // Update player data when movement is detected
    socket.on('playerMovement', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].attacking = data.attacking;
        }
    });

    // When a player disconnects, remove them from the game
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// Emit player updates 60 times per second to all clients
setInterval(() => {
    io.emit('playerUpdates', players);
}, 1000 / 60);  // 60fps update rate

server.listen(3000, () => {
    console.log('Server running on port 3000');
});

