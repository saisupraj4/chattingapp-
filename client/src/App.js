import React,{useRef, useState} from "react";
import io from "socket.io-client";


import Modal from 'react-modal';


import Peer from "peerjs";

import Login from "./components/login.js";
import Register from "./components/register.js";
import Home from "./components/home.js";

const socket = io.connect("http://localhost:8000",{ transports : ['websocket'] });


function App() {

  var peer = new Peer();

  const [isRegistered, updateisRegistered]=useState(true);
  const [isLoggedin, updateisLoggedin]=useState(false);

  const [username, updateusername]=useState("");
  const [password, updatepassword]=useState("");
  const [chatHistory, updatechatHistory]=useState("");

  const [receiver, updatereceiver]=useState("");
  const [message, updatemessage]=useState("");
  const [sender, updatesender]=useState("");

  const [newMessageAlert, updatenewMessageAlert]=useState(false);

  const [open, setOpen] = useState(false);

  // const [peerId, updatePeerId]=useState("");

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);


  function checkLoginCredentials()
  {
    socket.emit("checkLoginCredentials", {username, password});

    socket.on("noUserFound", ()=>{
      updateisRegistered(false);
    })

    socket.on("loginSuccess", (chatHistory)=>{
      updatechatHistory(chatHistory);
      updateisLoggedin(true);
    })
  }

  function newRegistration()
  {
    socket.emit("newRegistration", {username, password});

    socket.on("registrationSuccess",()=>{
      updateisRegistered(true);
    })
  }

  function sendMessage()
  {
    if(message!="" && message!=" ")
    socket.emit("sendMessage", {username, receiver, message});

    socket.on("sendSuccess", (chatHistory)=>{
      updatechatHistory(chatHistory);
      updatenewMessageAlert(true);
    })
  }

  function addSender()
  {
    socket.emit("addSender", {sender, username});

    socket.on("senderAddSuccess", (chatHistory)=>{
      updatechatHistory(chatHistory);
    })
  }

React.useEffect(()=>{
  socket.on("newMessageReceived", (chatHistory)=>{
    updatechatHistory(chatHistory);
    updatenewMessageAlert(true);
  })
}, [])



function handleVideoCall()
{
  console.log(username, receiver);
  console.log(peer.id);

  let senderPeerId = peer.id;
  let senderRoomId = username;
  socket.emit("initiateVideoCall", {receiver, senderPeerId, senderRoomId});
}

React.useEffect(()=>{
  socket.on("requestVideoCall", (requestVideoCallDetails)=>{
    const {senderPeerId, senderRoomId} = requestVideoCallDetails;

    console.log(requestVideoCallDetails);

    //ask if the user is interested later

    // setOpen(true);
    // <Modal
    //     open={open}
    //     onClose={setOpen(false)}
    //     aria-labelledby="modal-modal-title"
    //     aria-describedby="modal-modal-description"
    //   >
    //       <h2 id="modal-modal-title" variant="h6" component="h2">
    //         Text in a modal
    //       </h2>
    //       <p id="modal-modal-description" sx={{ mt: 2 }}>
    //         Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
    //       </p>
    //   </Modal>

    let receiverPeerId=peer.id;
    socket.emit("acceptVideoCall", {receiverPeerId, senderRoomId});

    peer.on("call", (call)=>{
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      }).then((receiverStream)=>{
        myVideoRef.current.srcObject = receiverStream;
        call.answer(receiverStream);
      })

      call.on("stream", (remoteStream)=>{
        console.log('Received remote stream up');

        remoteVideoRef.current.srcObject = remoteStream;
      })

    })
  })

  socket.on("userJoined", async (acceptVideoCallDetails)=>{
    console.log("Accepted");
    const {receiverPeerId} = acceptVideoCallDetails;

    await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then((senderStream)=>{
      myVideoRef.current.srcObject = senderStream;
      const call = peer.call(receiverPeerId, senderStream);

      call.on("stream", (remoteStream)=>{
        console.log('Received remote stream down');

        remoteVideoRef.current.srcObject = remoteStream;
      })
    })
  })
}, [])




  return (
    <div>
      {isRegistered?(isLoggedin?<Home username={username} chatHistory={chatHistory} updatereceiver={updatereceiver} updatemessage={updatemessage} sendMessage={sendMessage} updatesender={updatesender} addSender={addSender} newMessageAlert={newMessageAlert} updatenewMessageAlert={updatenewMessageAlert} handleVideoCall={handleVideoCall} myVideoRef={myVideoRef} remoteVideoRef={remoteVideoRef}/>:<Login updateusername={updateusername} updatepassword={updatepassword} checkLoginCredentials={checkLoginCredentials}/>):<Register updateusername={updateusername} updatepassword={updatepassword} newRegistration={newRegistration}/>}
    </div>
  );
}

export default App;
