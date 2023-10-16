import React from "react";

import "../App.css";

function RetrievedChats(props)
{
    const {wantedConnection, wantedChats, updatemessage, sendMessage, chatHistory, handleVideoCall, myVideoRef, remoteVideoRef} = props;
    const chatAreaRef = React.useRef(null);

    React.useEffect(() => {
        setTimeout(() => {
            updatemessage("");
            const textarea = document.getElementById("textArea");
            textarea.value = "";
            if (chatAreaRef.current) {
              chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
            }
          }, 0);
      }, [chatHistory]);

    function segregateChats(chat)
    {
        let sender = chat.sender;
        let receiver = chat.receiver;

        return (sender === wantedConnection?<p className="sender">{chat.message}</p>:<p className="receiver">{chat.message}</p>)
    }

    return (
        <div className="sub-right">
            <div className="wantedConnection"><box-icon type='solid' name='user' /><h3>{wantedConnection}</h3><button onClick={handleVideoCall}>Video Call</button></div>
            <div className="chatArea" ref={chatAreaRef}>
                {wantedChats.map(segregateChats)}
            </div>

                <div className="sendMessage">
                    <textarea id="textArea" onChange={(e)=>{updatemessage(e.target.value)}} placeholder="Message"></textarea>

                    <button onClick={sendMessage}><box-icon type='solid' name='send'></box-icon></button>
                </div>

                {/* <video autoPlay ref={myVideoRef}></video>
                <video autoPlay ref={remoteVideoRef}></video> */}
        </div>
    )
}

export default RetrievedChats;