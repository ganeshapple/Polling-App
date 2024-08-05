// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let pollResults = {
  option1: 0,
  option2: 0,
  option3: 0,
};

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('pollResults', pollResults);

  socket.on('vote', (option) => {
    pollResults[option]++;
    io.emit('pollResults', pollResults);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
