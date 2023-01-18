
 const socket = io("/");
 const main__chat__window = document.getElementById("main__chat__window");
 const videoGrids = document.getElementById("video-grids");
 const myVideo = document.createElement("video");
 const chat = document.getElementById("chat");

 OtherUsername = "";
 myVideo.muted = true;

 window.onload = () => {
    $(document).ready(function (){
        $("#getCodeModal").modal("show");
    })
 }

 var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3001"
 });

 let myVideoStream;
 const peers = {};

 var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

 navigator.getUserMedia({
    video: true,
    audio: true,
 }).then((stream)=> {
    myVideoStream = stream;
    addVideoStream(myVideo, stream, myname);

    socket.on("user-connected", (id, username)=> {
        connectToNewUser(id, stream, username);
        socket.emit("tellName", myname);
    });

    socket.on("user-disconnected", (id)=> {
        if(peers[id]) peers[id].close();
    })
 });

 peer.on("call", (call)=> {
    getUserMedia({ video: true, audio: true}, (stream)=> {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (remoteStream)=> {
            addVideoStream(video, remoteStream, OtherUsername);
        })
    })
 })

 peer.on("open", (id)=> {
    socket.emit("join-room", roomId, id, myname);
 });

 socket.on("AddName", (username)=> {
    OtherUsername = username;
 });

 const RemoveUnusedDivs = () => {
    const alldivs = videoGrids.getElementsByTagName("div");
    for(var i = 0; i < alldivs.length; i++){
        e= alldivs[i].getElementsByTagName("video").length;
        if( e=== 0){
            alldivs[i].remove();
        }
    }
 }

 const connectToNewUser = (userId, streams, myname)=> {
    const call = peer.call(userId, streams);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream)=> {
        addVideoStream(video, userVideoStream, myname);
    })

    call.on("close", ()=> {
        video.remove();
        RemoveUnusedDivs();
    });
    peers[userId] = call;
 }

 const addVideoStream = (videoEl, stream, name)=> {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", ()=> {
        videoEl.play()
    });
    const h1 = document.createElement("h1");
    const h1name = document.createTextNode(name);
    h1.appendChild(h1name);

    const videoGrid = document.createElement("div")
    videoGrid.classList.add("video-grid");
    videoGrid.appendChild(h1);
    videoGrids.appendChild(videoGrid);
    videoGrid.append(videoEl);

    RemoveUnusedDivs();

    let totalUsers = document.getElementsByTagName("video").length;
    if(totalUsers > 1){
        for(let i = 0; i< totalUsers; i++){
            document.getElementsByTagName("video")[i].style.width = 100 / totalUsers + "%";
        }
    }

 }

 const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        myVideoStream.getAudioTracks()[0].enabled = true;
        
    }
 }


 const VideomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        myVideoStream.getVideoTracks()[0].enabled = true;
        
    }
 }