// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));

let polls = {};

app.post('/create', (req, res) => {
  const { id, options } = req.body;
  if (polls[id]) {
    return res.status(400).send('Poll with this ID already exists');
  }
  polls[id] = options.reduce((acc, option) => {
    acc[option] = 0;
    return acc;
  }, {});
  res.status(201).send('Poll created');
});

app.get('/polls', (req, res) => {
  res.json(Object.keys(polls));
});

app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  if (!polls[id]) {
    return res.status(404).send('Poll not found');
  }
  delete polls[id];
  res.status(200).send('Poll deleted');
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinPoll', (pollId) => {
    if (polls[pollId]) {
      socket.join(pollId);
      socket.emit('pollResults', polls[pollId]);
    } else {
      socket.emit('error', 'Poll not found');
    }
  });

  socket.on('vote', ({ pollId, option }) => {
    if (polls[pollId] && polls[pollId][option] !== undefined) {
      polls[pollId][option]++;
      io.to(pollId).emit('pollResults', polls[pollId]);
    } else {
      socket.emit('error', 'Invalid poll or option');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
