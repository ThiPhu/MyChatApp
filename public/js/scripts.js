const socket= io.connect('https://my-videochat-app.herokuapp.com/')
const videoGrid=document.getElementById('video_box')

// Setup peer sv
const peer = new Peer(undefined,{
    host:'my-videochat-app.herokuapp.com',
    port: 443,
    secure: true,
})

const myVideo=document.createElement('video')
myVideo.muted=true
const peers = {}
// Yêu cầu quyền truy cập video và audio
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    addVideoStream(myVideo,stream)

    peer.on('call', call =>{
        call.answer(stream)

        const video = document.createElement('video')

        call.on("stream", userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        console.log("User", userId,"CONNECTED!")
        connectToNewUser(userId, stream)
    })
})


socket.on('user-disconnected', userId =>{
    if(peers[userId])
        peers[userId].close()
    console.log("User", userId, "DISCONNECTED!")
})

peer.on('open',id=>{
    socket.emit('join-room',ROOM_ID,id)
})

function addVideoStream(video,stream){
    video.srcObject=stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video)
}

function connectToNewUser(userId,stream){
    // Call a user and send video stream
    const call = peer.call(userId, stream)

    const video = document.createElement('video')

    // Call event handler
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

// Button get chat room url
const btnGetLink = document.querySelector(".button-get-link")
btnGetLink.addEventListener("click", (event)=>{
    const pageURL = window.location.href
    // Copy url to clipboard
    navigator.clipboard.writeText(pageURL).then(function(){
        alert("Lấy link thành công!")
    }, function(err){
        alert("Có lỗi", err)
    })
})
