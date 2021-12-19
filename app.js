const express = require('express');

const app = express();
require('dotenv').config();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Dẫn đến một trang có v4 uid - Mã ID url của phòng call
app.get('/', (req, res) => {
  return res.render('home');
});

app.get('/video', (req, res) => {
  res.redirect(`/video/${uuidV4()}`);
});

// Lấy mã ID Url phòng call thông qua uuid
app.get('/video/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// Xử lý server với socket io

// Connection để xử lý khi có nhiều người tham gia
io.on('connection', socket => {
  // Event listener - Khi ai tham gia phòng video call, sẽ truyền roomId và userId
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);

    // user_list.push(userId)
    // console.log(user_list)

    // Broadcast đến các user khác về sự hiện diện của user mới join
    socket.broadcast.to(roomId).emit('user-connected', userId);

    // Disconnect
    socket.on('disconnect', () => {
    // Broadcast đến các user khác về sự kiện đăng xuất của user 
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });
  });

  // socket.on('new-user', (userId)=>{
  //   user_list.push(userId)
  //   console.log(user_list)
  // })
});

server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
