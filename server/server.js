const express = require("express");
const mongoose = require("mongoose");
const socket = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = app.listen(8000,()=>{console.log("Server Started :: 8000");})

const io = socket(server);

mongoose.connect("mongodb://0.0.0.0:27017/chatDB");

const chatSchema={
    sender: String,
    receiver: String,
    message: String
}

const userSchema={
    username: String,
    password: String,
    chatHistory: [chatSchema]
}

const user = mongoose.model("user", userSchema);
const chat = mongoose.model("chat", chatSchema);

const usernametToSocketId = [];
const activeUsers = [];


io.on("connection", (socket)=>{
    console.log("Connection Established, id: "+ socket.id);

    socket.on("checkLoginCredentials", (loginCredentials)=>{
        const {username, password} = loginCredentials;

        user.findOne({username: username}).then((foundUser)=>{
            if(!foundUser){
                console.log("No User Found");

                socket.emit("noUserFound",{});
            }

            else
            {
                if(foundUser.password === password)
                {
                    console.log("Login Success");
                    usernametToSocketId[username]=socket.id;

                    console.log(usernametToSocketId);

                    let chatHistory = foundUser.chatHistory;

                    socket.emit("loginSuccess", {chatHistory});

                }

                else
                {
                    console.log("Wrong Password");
                }
            }
        })
    })

    socket.on("newRegistration", (registrationCredentials)=>{
        const {username, password} = registrationCredentials;

        const newUser = new user({
            username: username,
            password: password,
            chatHistory: []
        })

        newUser.save();

        socket.emit("registrationSuccess",{});
    })

    socket.on("sendMessage", (messageDetails)=>{

        const {username, receiver, message} = messageDetails;

        let newChat = new chat({
            sender: username,
            receiver: receiver,
            message: message
        })

        user.findOne({username: username}).then((foundSender)=>{
            if(foundSender)
            {
                foundSender.chatHistory.push(newChat);
                foundSender.save();
            }

            else
            {
                console.log("No Sender Found");
            }
        

        user.findOne({username: receiver}).then((foundUser)=>{
            if(foundUser)
            {
                foundUser.chatHistory.push(newChat);
                foundUser.save();

                let chatHistory=foundSender.chatHistory;
                socket.emit("sendSuccess", {chatHistory});

                chatHistory=foundUser.chatHistory;
                io.to(usernametToSocketId[receiver]).emit("newMessageReceived",{chatHistory});
            }

            else
            {
                console.log("No Receiver Found");
            }
        })
        })
    })

    socket.on("addSender", (senderDetails)=>{
        const {sender, username}=senderDetails;

        user.findOne({username: username}).then((foundUser)=>{
            user.findOne({username: sender}).then((foundSender)=>{
                if(!foundSender)
                {
                    console.log("No User Found");
                }

                else
                {
                    let newChat = new chat({
                        sender: sender,
                    })

                    foundUser.chatHistory.push(newChat);
                    foundUser.save().then(()=>{
                        let chatHistory=foundUser.chatHistory;
                        socket.emit("senderAddSuccess", {chatHistory});
                    });
                }
            })

        })
    })

    socket.on("initiateVideoCall", (initiateVideoCallDetails)=>{
        const {receiver, senderPeerId, senderRoomId} = initiateVideoCallDetails;

        console.log(initiateVideoCallDetails);

        socket.join(senderRoomId);

        io.to(usernametToSocketId[receiver]).emit("requestVideoCall", {senderPeerId, senderRoomId});
    })

    socket.on("acceptVideoCall", (acceptVideoCallDetails)=>{
        const {receiverPeerId, senderRoomId} = acceptVideoCallDetails;
        
        console.log("Accepted: "+acceptVideoCallDetails);

        socket.join(senderRoomId);

        socket.broadcast.to(senderRoomId).emit("userJoined", {receiverPeerId});
    })
    
})