// hold the actual socket server
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const port = process.env.PORT || 8000;
// const index = require("./routes/index");

const app = express();
// app.use(index);

const server = http.createServer(app); //listen for socket connection

const io = socketIo(server); // initialize a new instance by passing in the server object

let historyData = Array(5).fill([])
io.on('connection', function (socket) {
    console.log('a user connected')
    // listen for client calculation
    socket.on('new history', data => {
        //             [ ...[1 2 3 4 5], 8 ] de-array to an outer array 
        //             [ 1, 2, 3, 4, 5, 8  ]
        console.log('New incoming history: ', data)
        historyData = [...historyData.slice(1, 5), data.history[data.history.length - 1]]
        console.log("the latest history element is: ", data.history[data.history.length - 1])
        console.log('merged historyData ', historyData)
        console.log("the current digit is: ", data.digit)
        io.emit('new history', data.history)

    })
    socket.on("disconnect", () => console.log("Client disconnected."))

})
server.listen(port, () => console.log(`Listening on port ${port}`))


// socket.on('new-calculation', (data) => {
//     console.log("new-calculation-key is " + data.key)
//     io.emit('new-remote-calculation', data.key)
// })
// socket.on('hi', (msg) => {
//     io.emit('hi', msg)
//     console.log(msg.message + msg.user + " dispay digit is " + msg.state.digits + " equation is " + msg.state.equation + " history is " + msg.state.history)
// })
// socket.on('new-digit', (data) => {
//     console.log("new digit is" + data.digit)
//     io.emit('new-remote-digit', data.digit)
// }) //["" ,"" ,"","",""]
// socket.on('Action key', (data) => {
//     // console.log('Action key: ', data)
//     if (data.key === '=') {
//         io.emit('Remote event', data)
//     }
//     console.log('New HISTORYYYY: ', data)
// })