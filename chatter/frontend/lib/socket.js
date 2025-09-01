import { io } from "socket.io-client";

const options ={
    "force new connection":true,
    reconnectionAttempts:"Infinity",
    timeout:5000,
    transports:["websocket"]

}

const socket = io.connect('http://localhost:5001',options);

export default socket