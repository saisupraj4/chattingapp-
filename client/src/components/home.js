import React, { useState } from "react";
import RetrievedChats from "./retrievedChats.js";
import Welcome from "./welcome.js";

import "../App.css";

function Home(props)
{
    const [wantedConnection, updatewantedConnection]=useState("");
    const [wantedChats, updatewantedChats]=useState("");
    const {username, chatHistory, updatereceiver, updatemessage, sendMessage, updatesender, addSender, newMessageAlert, updatenewMessageAlert, handleVideoCall, myVideoRef, remoteVideoRef} = props;

    const uniqueConnections = [];

    React.useEffect(() => {
        setTimeout(() => {
            // updatesender("");
            const senderDetails = document.getElementById("senderDetails");
            senderDetails.value = "";
          }, 0);
      }, [chatHistory]);

    React.useEffect(() => {
        if (newMessageAlert) {
          handleClick(wantedConnection);
          updatenewMessageAlert(false);
        }
      }, [newMessageAlert, wantedConnection, wantedChats]);

    function handleClick(connection)
    {
        updatewantedConnection(connection);
        updatereceiver(connection); 
        const filteredChats = chatHistory.chatHistory.filter(chat =>
            chat.sender === connection || chat.receiver === connection
        );
        updatewantedChats(filteredChats);
    }

    function retrieveConnections()
    {
        for(const chat of chatHistory.chatHistory)
        {
            if(!uniqueConnections.includes(chat.sender) && chat.sender!=username)
            {
                uniqueConnections.push(chat.sender);
            }
        }
    }

    retrieveConnections();

    function listConnections(connection)
    {
        return (
            <button className="connection" onClick={()=>{handleClick(connection)}}>{connection}</button>
        )
    }

    return (
        <div className="home">
            <div className="flex-container">
            <div className="flex-child left">
            <div className="nav-bar"><h2>Chatting App</h2></div>
                <div className="addSender">
                    <input id="senderDetails" onChange={(e)=>{updatesender(e.target.value)}} placeholder="New Connection's Username"></input>
                    <button onClick={addSender}>Add</button>
                </div>
                <div className="connectionDetails">
                    {uniqueConnections.map(listConnections)}
                </div>

                <div className="userDetails"><h5 className="username"><box-icon type='solid' name='user'></box-icon> {username}</h5></div>
            </div>

            <div className="flex-child right">
                {wantedChats.length?<RetrievedChats wantedConnection={wantedConnection} wantedChats={wantedChats} updatereceiver={updatereceiver} updatemessage={updatemessage} sendMessage={sendMessage} chatHistory={chatHistory} handleVideoCall={handleVideoCall} myVideoRef={myVideoRef} remoteVideoRef={remoteVideoRef}/>:<Welcome />}
            </div>
            </div>

                <video autoPlay ref={myVideoRef}></video>
                <video autoPlay ref={remoteVideoRef}></video>
        </div>
    )
}

export default Home;