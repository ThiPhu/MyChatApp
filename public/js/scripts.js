const socket = io('https://my-chatapp-rtc.herokuapp.com/');

// Socket for localhost
// const socket = io('/');

// Setup peer sv
const peer = new Peer(undefined, {
  // For on heroku
  host: 'my-peerjs-sv.herokuapp.com',
  port: 443,
  secure: true,

  // For localhost
  // host: '/',
  // port: 8000
});
// 
const videoWrapper = document.getElementById('video_box');

// Khởi tạo object user_list chứa biến call của các user tham gia phòng
const user_list = {};

// Tạo DOM video element 
const videoContainer = document.createElement('video');
videoContainer.muted = true;

peer.on('open', userId => {
  socket.emit('join-room', ROOM_ID, userId);
});

// Yêu cầu quyền truy cập video và audio
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then(stream => {
    addVideoStream(videoContainer, stream);

    // on recive call from another peer handler
    peer.on('call', call => { 
      // answer to those who call and send the stream 
      call.answer(stream);

      // Create new  DOM video element
      const video = document.createElement('video');

      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', userId => {
      console.log('User', userId, 'CONNECTED!');
      connectToNewUser(userId, stream);
    });
  });

socket.on('user-disconnected', userId => {
  if (user_list[userId]) user_list[userId].close();
  console.log('User', userId, 'DISCONNECTED!');
});


function connectToNewUser(userId, stream) {
  // Call a user and send video stream
  const call = peer.call(userId, stream);

  // Create DOM video element for new user
  const video = document.createElement('video');
  video.setAttribute("data-id",userId)
  // Call event handler
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });

  // Remove video element on DOM when user leave the room
  call.on('close', () => {
    video.remove();
  });

  user_list[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoWrapper.append(video);
}

// Button get chat room url
const btnGetLink = document.querySelector('.button-get-link');
btnGetLink.addEventListener('click', event => {
  const roomId = window.location.href.split("/").at(-1);
  // Copy url to clipboard
  navigator.clipboard.writeText(roomId).then(
    function () {
      alert('ID phòng lưu vào bộ nhớ tạm!');
    },
    function (err) {
      alert('Có lỗi', err);
    }
  );
});
