// api/socket.js
const { Server } = require('socket.io');

const handler = (req, res) => {
    // Initialize Socket.IO only once
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server, {
            cors: {
                origin: '*', // Adjust as necessary for security
                methods: ['GET', 'POST'],
            },
        });

        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log('A player connected:', socket.id);

            // Add your socket events here
            socket.on('playerMovement', (data) => {
                console.log(`Player ${socket.id} moved to:`, data);
            });

            socket.on('disconnect', () => {
                console.log('Player disconnected:', socket.id);
            });
        });
    }
    
    // Respond to the request to keep the serverless function alive
    res.end();
};

module.exports = handler;
