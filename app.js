const express = require('express');

const app = express();
require("dotenv").config();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Dẫn đến một trang có v4 uid - Mã ID url của phòng call
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

// Lấy mã ID Url phòng call thông qua uuid
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// Xử lý server với socket io

// Connection để xử lý khi có nhiều người tham gia
io.on('connection', socket => {
  // Event listener - Khi ai tham gia phòng video call, sẽ truyền roomId và userId
  socket.on('join-room', (roomId, userId) => { 
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)

    // Disconnect 
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  });

});

server.listen(port, () => {
  console.log(`Server is running on ${port }`);
});
